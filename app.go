package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/pkg/errors"
	"github.com/vovan-ve/sple-desktop/internal/backend"
	"github.com/vovan-ve/sple-desktop/internal/config"
	"github.com/vovan-ve/sple-desktop/internal/files"
	"github.com/vovan-ve/sple-desktop/internal/helpers"
	"github.com/vovan-ve/sple-desktop/internal/singleton"
	"github.com/vovan-ve/sple-desktop/internal/storage"
	"github.com/wailsapp/wails/v2/pkg/logger"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type AppOptions struct {
	Logger           logger.Logger
	StartupOpenFiles []string
	StartupError     error
}

// App struct
type App struct {
	ctx         context.Context
	appConfig   storage.Full[string]
	frontConfig storage.Full[string]
	chosenReg   files.ChosenRegistry
	files       files.Storage

	isDirty bool

	opt *AppOptions
}

// NewApp creates a new App application struct
func NewApp(opt *AppOptions) *App {
	if opt == nil {
		opt = &AppOptions{}
	}
	return &App{
		opt: opt,
	}
}

// startup is called at application startup
func (a *App) startup(ctx context.Context) {
	// Perform your setup here
	a.ctx = ctx

	configDir := config.GetConfigsDir()
	if err := config.EnsureDir(configDir, "config dir"); err != nil {
		runtime.LogErrorf(ctx, "%v", err)
		return
	}

	appConfig, err := config.NewFileStorage(filepath.Join(configDir, "config.json"))
	if err != nil {
		runtime.LogErrorf(ctx, "front config: %v", err)
		return
	}

	front, err := config.NewFileStorage(filepath.Join(configDir, "front.json"))
	if err != nil {
		runtime.LogErrorf(ctx, "front config: %v", err)
		return
	}

	filesRegPath := filepath.Join(configDir, "files.json")
	chosenReg := files.NewChosenRegistry()
	fs, err := files.NewStorage(ctx, filesRegPath, chosenReg)
	if err != nil {
		runtime.LogErrorf(ctx, "files registry: %v", err)
		return
	}

	a.appConfig = appConfig
	a.frontConfig = front
	a.chosenReg = chosenReg
	a.files = fs

	go a.singletonServer()
}

// domReady is called after front-end resources have been loaded
func (a *App) domReady(ctx context.Context) {
	// Add your action here

	winPl, _, err := a.appConfig.GetItem(config.AppWindowPlacement)
	if err != nil {
		runtime.LogErrorf(ctx, "cannot read %s: %v", config.AppWindowPlacement, err)
	}
	p := config.WindowPlacementFromString(winPl)
	if p.IsMax {
		runtime.WindowMaximise(ctx)
	} else {
		runtime.WindowSetPosition(ctx, p.X, p.Y)
		runtime.WindowSetSize(ctx, p.W, p.H)
	}

	if len(a.opt.StartupOpenFiles) != 0 {
		ref, err := a.openFiles(a.opt.StartupOpenFiles)
		a.opt.StartupOpenFiles = nil
		a.showError(&err)
		if len(ref) != 0 {
			a.triggerFront(backend.FEOpenFiles, ref)
		}
	}
	a.showError(&a.opt.StartupError)
	a.opt.StartupError = nil

	go a.checkUpdate()
}

func (a *App) checkUpdate() {
	defer a.catchPanic()

	lastKnownUpdateS, _, err := a.appConfig.GetItem(config.AppLatestRelease)
	if err != nil {
		runtime.LogErrorf(a.ctx, "cannot read %s: %v", config.AppLatestRelease, err)
	}
	lastKnownUpdate := config.UpdateReleaseFromString(lastKnownUpdateS)

	defer func() {
		if lastKnownUpdate != nil {
			select {
			case <-a.ctx.Done():
				return
			default:
			}

			v := lastKnownUpdate.VersionNumber()

			// if triggered after front init
			a.triggerFront(backend.FEUpgradeAvailable, v)

			// if triggered before front init
			b, err := json.Marshal(v)
			if err != nil {
				runtime.LogErrorf(a.ctx, "json marshal: %v", err)
				return
			}
			runtime.WindowExecJS(a.ctx, "window.spleLatestVersion="+string(b)+";")
		}
	}()

	latestRelease, err := config.UpdateReleaseFetch(a.ctx)
	if err != nil {
		runtime.LogErrorf(a.ctx, "check update: %v", err)
		return
	}
	if latestRelease == nil {
		return
	}
	if !latestRelease.IsNewer(lastKnownUpdate) {
		return
	}
	// have new release
	lastKnownUpdate = latestRelease
	if err = a.appConfig.SetItem(config.AppLatestRelease, latestRelease.String()); err != nil {
		runtime.LogErrorf(a.ctx, "remember latest release: %v", err)
	}
}

// beforeClose is called when the application is about to quit,
// either by clicking the window close button or calling runtime.Quit.
// Returning true will cause the application to continue, false will continue shutdown as normal.
func (a *App) beforeClose(ctx context.Context) (prevent bool) {
	prevent = a.isDirty
	if prevent {
		a.triggerFront(backend.FEExitDirty, nil)
	} else {
		p := config.WindowPlacement{}
		p.X, p.Y = runtime.WindowGetPosition(ctx)
		p.W, p.H = runtime.WindowGetSize(ctx)
		p.IsMax = runtime.WindowIsMaximised(ctx)

		if err := a.appConfig.SetItem(config.AppWindowPlacement, p.String()); err != nil {
			runtime.LogErrorf(ctx, "cannot save window placement: %v", err)
		}
	}
	return
}

//// shutdown is called at application termination
//func (a *App) shutdown(ctx context.Context) {
//	// Perform your teardown here
//}

func (a *App) configStorage() storage.Full[string] {
	return a.frontConfig
}

func (a *App) filesStorage() storage.Full[*files.Record] {
	return a.files
}

func (a *App) showError(pErr *error) {
	if pErr == nil || *pErr == nil {
		return
	}
	a.triggerFront(backend.FEShowError, (*pErr).Error())
}

func (a *App) triggerFront(event string, data any) {
	runtime.EventsEmit(a.ctx, event, data)
}

func (a *App) catchPanic() {
	p := recover()
	if p == nil {
		return
	}
	runtime.LogFatalf(a.ctx, "panic: %+v", p)
}

func (a *App) CreateFile(key string, baseFileName string) (actualName string, err error) {
	defer a.catchPanic()
	fPath, err := runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		DefaultFilename: baseFileName,
		Title:           "Create File",
	})
	if err != nil || fPath == "" {
		return
	}
	f, err := os.OpenFile(fPath, os.O_WRONLY|os.O_CREATE, 0664)
	if err != nil {
		return
	}
	if err = f.Close(); err != nil {
		return
	}
	if err = a.chosenReg.AddFileWithKey(key, fPath); err != nil {
		return
	}
	return filepath.Base(fPath), nil
}

func (a *App) OpenFile(multiple bool) (ret []*backend.WebFileRef) {
	defer a.catchPanic()
	var err error
	defer a.showError(&err)

	var filenames []string
	if multiple {
		filenames, err = runtime.OpenMultipleFilesDialog(a.ctx, runtime.OpenDialogOptions{
			Title: "Open files",
		})
		if err != nil || filenames == nil {
			return nil
		}
	} else {
		var fn string
		fn, err = runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
			Title: "Open file",
		})
		if err != nil || fn == "" {
			return nil
		}
		filenames = append(filenames, fn)
	}

	ret, err = a.openFiles(filenames)
	return
}

func (a *App) openFiles(filenames []string) (ret []*backend.WebFileRef, _ error) {
	var failed []string
	for _, filename := range filenames {
		if has, err := a.files.HasFile(filename); err != nil {
			runtime.LogErrorf(a.ctx, "check if file already opened: %v", err)
		} else if has {
			continue
		}

		f, err := os.Stat(filename)
		if err != nil {
			failed = append(failed, fmt.Sprintf("- Cannot stat file <%s> - %s", filename, err.Error()))
			continue
		}
		b, err := files.NewFile(filename).Read()
		if err != nil {
			failed = append(failed, fmt.Sprintf("- Cannot read file <%s> - %s", filename, err.Error()))
			continue
		}
		ret = append(ret, &backend.WebFileRef{
			ID:     a.chosenReg.AddFile(filename),
			Blob64: helpers.B2A(b),
			Path:   filename,
			Name:   f.Name(),
			Size:   f.Size(),
		})
	}
	if len(failed) > 0 {
		return nil, errors.New("Cannot open following files:\n\n" + strings.Join(failed, "\n\n"))
	}
	return
}

func (a *App) singletonServer() {
	defer a.catchPanic()
	recv := make(chan []byte)
	go func() {
		defer a.catchPanic()
		defer close(recv)
		err := singleton.RunReceiver(a.ctx, a.opt.Logger, recv)
		if err != nil {
			runtime.LogErrorf(a.ctx, "IPC server run: %#v", err)
		}
	}()
	a.readSingletonMessages(recv)
}

func (a *App) readSingletonMessages(recv <-chan []byte) {
	for {
		select {
		case <-a.ctx.Done():
			return
		case b := <-recv:
			if b == nil {
				return
			}
			s, err := files.ArgFromIpc(b)
			if err != nil {
				runtime.LogWarningf(a.ctx, "cannot parse ipc message: %#v", err)
				continue
			}
			runtime.LogDebugf(a.ctx, "IPC file to open: %s", s)

			ref, err := a.openFiles([]string{s})
			a.showError(&err)
			if len(ref) != 0 {
				a.triggerFront(backend.FEOpenFiles, ref)
				// TODO: debounce activate window
				//runtime.WindowHide(a.ctx)
				//time.Sleep(10 * time.Millisecond)
				//runtime.WindowShow(a.ctx)
			}
		}
	}
}

func (a *App) SaveFileAs(blob64 helpers.Blob64, baseFileName string) {
	defer a.catchPanic()
	var err error
	defer a.showError(&err)

	b, err := helpers.A2B(blob64)
	if err != nil {
		return
	}

	path, err := runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		DefaultFilename: baseFileName,
		Title:           "Save As",
	})
	if err != nil || path == "" {
		return
	}
	err = files.NewFile(path).Write(b)
	return
}

func (a *App) SetIsDirty(isDirty bool) {
	defer a.catchPanic()
	a.isDirty = isDirty
}

func (a *App) GetAppInfo() string {
	defer a.catchPanic()
	return config.ReportInfo()
}
