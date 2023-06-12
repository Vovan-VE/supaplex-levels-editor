package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path"
	"strings"

	"github.com/adrg/xdg"
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

	configDir := path.Join(xdg.ConfigHome, "sple")
	if err := config.EnsureConfigDir(configDir); err != nil {
		runtime.LogErrorf(ctx, "config dir: %v", err)
		return
	}

	front, err := config.NewFileStorage(path.Join(configDir, "front.json"))
	if err != nil {
		runtime.LogErrorf(ctx, "front config: %v", err)
		return
	}

	filesRegPath := path.Join(configDir, "files.json")
	chosenReg := files.NewChosenRegistry()
	fs, err := files.NewStorage(filesRegPath, chosenReg)
	if err != nil {
		runtime.LogErrorf(ctx, "files registry: %v", err)
		return
	}

	a.frontConfig = front
	a.chosenReg = chosenReg
	a.files = fs
}

//// domReady is called after front-end resources have been loaded
//func (a *App) domReady(ctx context.Context) {
//	// Add your action here
//}

// beforeClose is called when the application is about to quit,
// either by clicking the window close button or calling runtime.Quit.
// Returning true will cause the application to continue, false will continue shutdown as normal.
func (a *App) beforeClose(ctx context.Context) (prevent bool) {
	prevent = a.isDirty
	if prevent {
		a.triggerFront(backend.FEExitDirty, nil)
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

var _ backend.Interface = (*App)(nil)

func (a *App) CreateFile(key string, baseFileName string) (actualName string, err error) {
	filepath, err := runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		DefaultFilename: baseFileName,
		Title:           "Create File",
	})
	if err != nil || filepath == "" {
		return
	}
	f, err := os.OpenFile(filepath, os.O_WRONLY|os.O_CREATE, 0664)
	if err != nil {
		return
	}
	if err = f.Close(); err != nil {
		return
	}
	if err = a.chosenReg.AddFileWithKey(key, filepath); err != nil {
		return
	}
	return path.Base(filepath), nil
}

func (a *App) OpenFile(multiple bool) []*backend.WebFileRef {
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
	var err error
	defer a.showError(&err)

	b, err := helpers.A2B(blob64)
	if err != nil {
		return
	}

	filepath, err := runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		DefaultFilename: baseFileName,
		Title:           "Save As",
	})
	if err != nil || filepath == "" {
		return
	}
	err = files.NewFile(filepath).Write(b)
	return
}

func (a *App) SetIsDirty(isDirty bool) {
	a.isDirty = isDirty
}
