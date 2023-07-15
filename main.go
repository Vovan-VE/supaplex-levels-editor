package main

import (
	"embed"
	"fmt"
	"os"

	"github.com/vovan-ve/sple-desktop/internal/backend"
	"github.com/vovan-ve/sple-desktop/internal/logging"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/logger"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/windows"
)

//go:embed all:frontend/build-wails
var assets embed.FS

func main() {
	var lg logger.Logger
	defer func() {
		r := recover()
		if r == nil {
			return
		}

		if lg != nil {
			lg.Fatal(fmt.Sprintf("PANIC recovery: %+v\n", r))
		} else {
			println("PANIC recovery:", r)
		}
		os.Exit(1)
	}()

	// Create an instance of the app structure
	app := NewApp()

	lg = logging.GetLogger()

	// Create application with options
	err := wails.Run(&options.App{
		Title:  "SpLE",
		Width:  1024,
		Height: 768,
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
		},
		//Linux: &linux.Options{},
		//Mac: &mac.Options{},
		Debug: options.Debug{
			OpenInspectorOnStartup: true,
		},
	})
	if err != nil {
		if lg != nil {
			lg.Error(err.Error())
		} else {
			println("Error:", err)
		}
	}
}
