package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/pkg/errors"
	"github.com/vovan-ve/sple-desktop/internal/backend"
	"github.com/vovan-ve/sple-desktop/internal/config"
	"github.com/vovan-ve/sple-desktop/internal/files"
	"github.com/vovan-ve/sple-desktop/internal/helpers"
	"github.com/vovan-ve/sple-desktop/internal/storage"
	"github.com/wailsapp/wails/v3/pkg/application"
)

const (
	// since 0.21.0: remove either after several versions, or since 1.0
	configFileConfigOld = "config.json"
	configFileConfig    = "config.v1.json"

	// since 0.21.0: remove either after several versions, or since 1.0
	configFileFrontOld = "front.json"
	configFileFront    = "front.v1.json"

	// since 0.21.0: remove either after several versions, or since 1.0
	configFileFilesOld = "files.json"
	configFileFiles    = "files.v1.json"
)

// App struct
type App struct {
	app         *application.App
	window      *application.WebviewWindow
	appConfig   storage.Full[string]
	frontConfig storage.Full[string]
	chosenReg   files.ChosenRegistry
	files       files.Storage
	iowg        sync.WaitGroup

	isDirty bool

	// DomReady keep triggering with every drag-n-drop
	// https://github.com/wailsapp/wails/issues/3563
	onceDomReady sync.Once
	//dropFiles    chan []string
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{
		//dropFiles: make(chan []string, 1),
	}
}

func (a *App) connect(app *application.App, win *application.WebviewWindow) {
	a.app = app
	a.window = win
}

func (a *App) startup(event *application.ApplicationEvent) {
	a.app.Logger.Info("startup")
	configDir := config.GetConfigsDir()
	if err := config.EnsureDir(configDir, "config dir"); err != nil {
		a.app.Logger.Error("%v", err)
		return
	}

	appConfig, err := config.NewFileStorage(config.FileStorageOptions{
		Logger:      a.app.Logger,
		Filepath:    filepath.Join(configDir, configFileConfig),
		FilepathOld: filepath.Join(configDir, configFileConfigOld),
		IOWG:        &a.iowg,
	})
	if err != nil {
		a.app.Logger.Error("front config: %v", err)
		return
	}

	front, err := config.NewFileStorage(config.FileStorageOptions{
		Logger:      a.app.Logger,
		Filepath:    filepath.Join(configDir, configFileFront),
		FilepathOld: filepath.Join(configDir, configFileFrontOld),
		IOWG:        &a.iowg,
	})
	if err != nil {
		a.app.Logger.Error("front config: %v", err)
		return
	}

	chosenReg := files.NewChosenRegistry(a.app.Logger)
	fs, err := files.NewStorage(files.StorageOptions{
		Logger:      a.app.Logger,
		Filepath:    filepath.Join(configDir, configFileFiles),
		FilepathOld: filepath.Join(configDir, configFileFilesOld),
		Chosen:      chosenReg,
		IOWG:        &a.iowg,
	})
	if err != nil {
		a.app.Logger.Error("files registry: %v", err)
		return
	}

	a.appConfig = appConfig
	a.frontConfig = front
	a.chosenReg = chosenReg
	a.files = fs

	//runtime.OnFileDrop(ctx, a.onFileDrop)
}

// domReady is called after front-end resources have been loaded
func (a *App) domReady(event *application.WindowEvent) {
	a.app.Logger.Info("dom ready")
	// https://github.com/wailsapp/wails/issues/3563
	a.onceDomReady.Do(a.domReadyHandler)

	//go func() {
	//	select {
	//	case paths := <-a.dropFiles:
	//		a.openFilesAtFront(paths)
	//	default:
	//	}
	//}()
}

func (a *App) domReadyHandler() {
	winPl, _, err := a.appConfig.GetItem(config.AppWindowPlacement)
	if err != nil {
		a.app.Logger.Error("cannot read %s: %v", config.AppWindowPlacement, err)
	}
	p := config.WindowPlacementFromString(winPl)
	if p.IsMax {
		a.window.Maximise()
	} else {
		a.window.SetPosition(p.X, p.Y)
		a.window.SetSize(p.W, p.H)
	}

	absFiles, err := files.NormalizeArgs(os.Args[1:])
	a.showError(&err)
	a.openFilesAtFront(absFiles)

	go a.checkUpdate()
}

func (a *App) secondInstance(data application.SecondInstanceData) {
	a.app.Logger.Info("secondInstance: %#v", data)

	absFiles, err := files.ResolveArgs(data.WorkingDir, data.Args)
	a.showError(&err)
	a.openFilesAtFront(absFiles)

	go a.activateWindow()
}

//func (a *App) onFileDrop(x, y int, paths []string) {
//	runtime.LogInfof(a.ctx, "drop files: %#v", paths)
//	// First drag-n-drop cause some strange bug with access at frontend.
//	// Also, every drop cause DomReady to trigger again.
//	// And so, I delay opening files until next fake DomReady will run.
//	go func() {
//		a.dropFiles <- paths
//	}()
//}

func (a *App) openFilesAtFront(absFiles []string) {
	if len(absFiles) == 0 {
		return
	}
	ref, err := a.openFiles(absFiles)
	a.showError(&err)
	if len(ref) != 0 {
		a.triggerFront(backend.FEOpenFiles, ref)
	}
	return
}

func (a *App) checkUpdate() {
	a.iowg.Add(1)
	defer a.iowg.Done()

	lastKnownUpdateS, _, err := a.appConfig.GetItem(config.AppLatestRelease)
	if err != nil {
		a.app.Logger.Error("cannot read %s: %v", config.AppLatestRelease, err)
	}
	lastKnownUpdate := config.UpdateReleaseFromString(lastKnownUpdateS)

	defer func() {
		if lastKnownUpdate == nil {
			return
		}
		select {
		case <-a.app.Context().Done():
			return
		default:
		}

		v := lastKnownUpdate.VersionNumber()

		// if triggered after front init
		a.triggerFront(backend.FEUpgradeAvailable, v)

		// if triggered before front init
		b, err := json.Marshal(v)
		if err != nil {
			a.app.Logger.Error("json marshal: %v", err)
			return
		}
		a.window.ExecJS("window.spleLatestVersion=" + string(b) + ";")
	}()

	latestRelease, err := config.UpdateReleaseFetch(a.app.Context())
	if err != nil {
		a.app.Logger.Error("check update: %v", err)
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
		a.app.Logger.Error("remember latest release: %v", err)
	}
}

func (a *App) shouldQuit() (should bool) {
	should = !a.isDirty
	if a.isDirty {
		a.triggerFront(backend.FEExitDirty, nil)
	}
	return
}

// shutdown is called at application termination
func (a *App) shutdown() {
	a.app.Logger.Info("shutdown")

	//close(a.dropFiles)
	if !a.window.IsMinimised() {
		p := config.WindowPlacement{}
		p.X, p.Y = a.window.Position()
		p.W, p.H = a.window.Size()
		p.IsMax = a.window.IsMaximised()

		if err := a.appConfig.SetItem(config.AppWindowPlacement, p.String()); err != nil {
			a.app.Logger.Error("cannot save window placement: %v", err)
		}
	}

	a.app.Logger.Info("wait pending I/O...")
	a.iowg.Wait()
	a.app.Logger.Info("wait pending I/O done")
}

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
	//a.app.Logger.Debug("App.triggerFront(%v, %v)", event, data)
	a.window.EmitEvent(event, data)
}

func (a *App) handlePanic(p *application.PanicDetails) {
	a.app.Logger.Error("panic: %+v", p.Error)
}

func (a *App) CreateFile(key string, baseFileName string) (actualName string, err error) {
	fPath, err := a.app.Dialog.SaveFile().
		AttachToWindow(a.window).
		SetFilename(baseFileName).
		PromptForSingleSelection()
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
	var err error
	defer a.showError(&err)

	var filenames []string
	dialog := a.app.Dialog.OpenFile().AttachToWindow(a.window)
	if multiple {
		filenames, err = dialog.
			SetTitle("Open files").
			PromptForMultipleSelection()
		if err != nil || filenames == nil {
			return nil
		}
	} else {
		var fn string
		fn, err = dialog.
			SetTitle("Open file").
			PromptForSingleSelection()
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
			a.app.Logger.Error("check if file already opened: %v", err)
		} else if has {
			continue
		}

		f, err := os.Stat(filename)
		if err != nil {
			failed = append(failed, fmt.Sprintf("- Cannot stat file: %s", err.Error()))
			continue
		}
		b, err := files.NewFile(filename).Read()
		if err != nil {
			failed = append(failed, fmt.Sprintf("- Cannot read file: %s", err.Error()))
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
		return nil, errors.New("Cannot open following files:\n" + strings.Join(failed, "\n"))
	}
	return
}

func (a *App) activateWindow() {
	// TODO: better activate window
	a.app.Logger.Debug("%v activating window", time.Now())
	//a.window.Hide()
	a.window.UnMinimise()
	time.Sleep(10 * time.Millisecond)
	//a.window.Show()
	a.app.Show()
}

func (a *App) SaveFileAs(blob64 helpers.Blob64, baseFileName string) {
	var err error
	defer a.showError(&err)

	b, err := helpers.A2B(blob64)
	if err != nil {
		return
	}

	path, err := a.app.Dialog.SaveFile().
		AttachToWindow(a.window).
		SetFilename(baseFileName).
		PromptForSingleSelection()
	if err != nil || path == "" {
		return
	}
	err = files.NewFile(path).Write(b)
	return
}

func (a *App) SetIsDirty(isDirty bool) {
	a.isDirty = isDirty
}

func (a *App) GetAppInfo() string {
	return config.ReportInfo()
}
