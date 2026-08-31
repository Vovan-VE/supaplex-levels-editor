//go:build !(production || debug) && !ios && !android

package logging

import (
	"log/slog"

	"github.com/wailsapp/wails/v3/pkg/application"
)

func GetLogger(_ Scope) *slog.Logger { return application.DefaultLogger(level) }
