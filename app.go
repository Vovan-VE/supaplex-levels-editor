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
	"github.com/vovan-ve/sple-desktop/internal/storage"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx         context.Context
	appConfig   storage.Full[string]
	frontConfig storage.Full[string]
	chosenReg   files.ChosenRegistry
	files       storage.Full[*files.Record]

	isDirty bool
}

// NewApp creates a new App application struct
func NewApp() *App { return &App{} }

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
	fs, err := files.NewStorage(filesRegPath, chosenReg)
	if err != nil {
		runtime.LogErrorf(ctx, "files registry: %v", err)
		return
	}

	a.appConfig = appConfig
	a.frontConfig = front
	a.chosenReg = chosenReg
	a.files = fs
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

	go a.checkUpdate()
}

func (a *App) checkUpdate() {
	lastKnownUpdateS, _, err := a.appConfig.GetItem(config.AppLatestRelease)
	if err != nil {
		runtime.LogErrorf(a.ctx, "cannot read %s: %v", config.AppLatestRelease, err)
	}
	lastKnownUpdate := config.UpdateReleaseFromString(lastKnownUpdateS)

	go func() {
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
	b, err := json.Marshal(&backend.FrontEvent{
		Type: event,
		Data: data,
	})
	if err != nil {
		runtime.LogErrorf(a.ctx, "triggerFront: marshal: %v", err)
		runtime.WindowExecJS(a.ctx, "window.spleFrontError()")
		return
	}
	runtime.WindowExecJS(a.ctx, "window.spleFrontEvent("+string(b)+")")
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

func (a *App) OpenFile(multiple bool) []*backend.WebFileRef {
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

	var (
		ret    []*backend.WebFileRef
		failed []string
	)
	for _, filename := range filenames {
		f, err2 := os.Stat(filename)
		if err2 != nil {
			failed = append(failed, fmt.Sprintf("- Cannot stat file <%s> - %s", filename, err2.Error()))
			continue
		}
		b, err2 := files.NewFile(filename).Read()
		if err2 != nil {
			failed = append(failed, fmt.Sprintf("- Cannot read file <%s> - %s", filename, err2.Error()))
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
		err = errors.New("Cannot open following files:\n\n" + strings.Join(failed, "\n\n"))
		return nil
	}
	return ret
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
