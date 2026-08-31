package main

import (
	"embed"
	"os"

	"github.com/vovan-ve/sple-desktop/internal/backend"
	"github.com/vovan-ve/sple-desktop/internal/config"
	"github.com/vovan-ve/sple-desktop/internal/helpers"
	"github.com/vovan-ve/sple-desktop/internal/logging"
	"github.com/wailsapp/wails/v3/pkg/application"
	"github.com/wailsapp/wails/v3/pkg/events"
)

const appTitle = "SpLE"

//go:embed all:frontend/dist-wails
var assets embed.FS

func main() {
	lg := logging.GetLogger(logging.ScopePre)
	defer func() {
		r := recover()
		if r == nil {
			return
		}
		lg.Error("PANIC recovery: %+v\n", r)
		os.Exit(1)
	}()

	lg = logging.GetLogger(logging.ScopeMain)
	service := NewApp()

	app := application.New(application.Options{
		Name: appTitle,
		Assets: application.AssetOptions{
			Handler: application.AssetFileServerFS(assets),
		},
		Logger: lg,
		SingleInstance: &application.SingleInstanceOptions{
			UniqueID:               "e692d42c-1713-46ba-b48e-85a34829d654",
			OnSecondInstanceLaunch: service.secondInstance,
		},
		PanicHandler: service.handlePanic,
		ShouldQuit:   service.shouldQuit,
		OnShutdown:   service.shutdown,
		Windows: application.WindowsOptions{
			WebviewUserDataPath: config.GetConfigsDir(),
		},
	})

	win := app.Window.NewWithOptions(application.WebviewWindowOptions{
		Title:            appTitle,
		Width:            1024,
		Height:           768,
		BackgroundColour: application.NewRGB(64, 64, 64),
		//EnableFileDrop: true,
		ZoomControlEnabled: false,
		Windows: application.WindowsWindow{
			Theme: application.Dark,
			// TODO: needed? EnableSwipeGestures: true,
		},
		//Linux: application.LinuxWindow{},
		OpenInspectorOnStartup: helpers.IsDebug,
		//Permissions: map[application.PermissionType]application.Permission{
		//	application.PermissionClipboardRead: application.PermissionAllow,
		//},
	})

	service.connect(app, win)
	app.RegisterService(application.NewService(service))
	app.RegisterService(application.NewService(&backend.ConfigStorage{
		F: service.configStorage,
	}))
	app.RegisterService(application.NewService(&backend.FilesStorage{
		F: service.filesStorage,
	}))

	app.Event.OnApplicationEvent(events.Common.ApplicationStarted, service.startup)
	win.OnWindowEvent(events.Common.WindowRuntimeReady, service.domReady)

	err := app.Run()
	if err != nil {
		lg.Error("%+v\n", err.Error())
		os.Exit(1)
	}
}
