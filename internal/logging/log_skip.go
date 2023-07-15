//go:build !production

package logging

import (
	"github.com/wailsapp/wails/v2/pkg/logger"
)

func GetLogger() logger.Logger { return nil }
