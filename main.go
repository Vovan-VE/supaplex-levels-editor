package main

import (
	"context"
	"embed"
	"fmt"
	"os"

	"github.com/pkg/errors"
	"github.com/vovan-ve/sple-desktop/internal/backend"
	"github.com/vovan-ve/sple-desktop/internal/config"
	"github.com/vovan-ve/sple-desktop/internal/files"
	"github.com/vovan-ve/sple-desktop/internal/logging"
	"github.com/vovan-ve/sple-desktop/internal/singleton"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/logger"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/linux"
	"github.com/wailsapp/wails/v2/pkg/options/windows"
)

const appTitle = "SpLE"

//go:embed all:frontend/build-wails
var assets embed.FS

func main() {
	lg := logging.GetLogger(logging.ScopePre)
	defer func() {
		r := recover()
		if r == nil {
			return
		}
		lg.Fatal(fmt.Sprintf("PANIC recovery: %+v\n", r))
	}()

	argFiles, argsErr := files.NormalizeArgs(os.Args[1:])
	if done, err := sendSingletonArgs(argFiles, lg); err != nil {
		lg.Fatal(fmt.Sprintf("singleton: %v", err))
	} else if done {
		lg.Info("The primary instance will do the job. Exiting.")
		os.Exit(0)
	}

	lg = logging.GetLogger(logging.ScopeMain)

	// Create an instance of the app structure
	app := NewApp(&AppOptions{
		Logger:           lg,
		StartupOpenFiles: argFiles,
		StartupError:     argsErr,
	})

	// Create application with options
	err := wails.Run(&options.App{
		Title:                    appTitle,
		Width:                    1024,
		Height:                   768,
		EnableDefaultContextMenu: true,
		//WindowStartState: options.Maximised,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour:   options.NewRGB(64, 64, 64),
		Logger:             lg,
		LogLevel:           logger.DEBUG,
		LogLevelProduction: logger.WARNING,
		OnStartup:          app.startup,
		OnDomReady:         app.domReady,
		OnBeforeClose:      app.beforeClose,
		//OnShutdown:       app.shutdown,
		Bind: []interface{}{
			app,
			&backend.ConfigStorage{
				F:     app.configStorage,
				Catch: app.catchPanic,
			},
			&backend.FilesStorage{
				F:     app.filesStorage,
				Catch: app.catchPanic,
			},
		},
		Windows: &windows.Options{
			IsZoomControlEnabled: false,
			Theme:                windows.Dark,
			WebviewUserDataPath:  config.GetConfigsDir(),
		},
		Linux: &linux.Options{
			ProgramName: appTitle,
		},
		//Mac: &mac.Options{},
		Debug: options.Debug{
			OpenInspectorOnStartup: true,
		},
	})
	if err != nil {
		lg.Fatal(err.Error())
	}
}

func sendSingletonArgs(args []string, l logger.Logger) (done bool, err error) {
	l.Debug(fmt.Sprintf("IPC args: %#v", args))
	messages, err := files.ArgsToIpc(args)
	if err != nil {
		return false, errors.Wrap(err, "ArgsToIpc")
	}
	done, err = singleton.TrySend(context.TODO(), l, messages)
	if err != nil {
		return false, errors.Wrap(err, "TrySend")
	}
	return done, nil
}
