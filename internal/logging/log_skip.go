//go:build !(production || debug)

package logging

import (
	"github.com/wailsapp/wails/v2/pkg/logger"
)

func GetLogger() logger.Logger { return logger.NewDefaultLogger() }
