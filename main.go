package main

import (
	"embed"

	"github.com/vovan-ve/sple-desktop/internal/backend"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/logger"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/windows"
)

//go:embed all:frontend/build-wails
var assets embed.FS

func main() {
	// Create an instance of the app structure
	app := NewApp()

	// Create application with options
	err := wails.Run(&options.App{
		Title:            "SpLE",
		Width:            1024,
		Height:           768,
		WindowStartState: options.Maximised,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour:   options.NewRGB(64, 64, 64),
		LogLevelProduction: logger.INFO,
		OnStartup:          app.startup,
		//OnDomReady:       app.domReady,
		OnBeforeClose: app.beforeClose,
		//OnShutdown:       app.shutdown,
		Bind: []interface{}{
			app,
			&backend.ConfigStorage{F: app.configStorage},
			&backend.FilesStorage{F: app.filesStorage},
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
		println("Error:", err)
	}
}
