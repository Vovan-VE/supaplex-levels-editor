//go:build production

package logging

import (
	"os"
	"path/filepath"

	"github.com/pkg/errors"
	"github.com/vovan-ve/sple-desktop/internal/config"
	"github.com/wailsapp/wails/v2/pkg/logger"
)

func GetLogger() logger.Logger {
	lg, err := prepareLogFile()
	if err != nil {
		println("Error: get logger:", err)
		return nil
	}
	return lg
}

var filenames = []string{"app.log", "app.log.1"}

func prepareLogFile() (logger.Logger, error) {
	dir := config.GetLogsDir()
	if err := config.EnsureDir(dir, "logs dir"); err != nil {
		return nil, err
	}

	var prev string
	for i := len(filenames) - 1; i >= 0; i-- {
		cur := filepath.Join(dir, filenames[i])

		_, err := os.Stat(cur)
		if os.IsNotExist(err) {
			// nothing
		} else if err != nil {
			return nil, errors.Wrap(err, "stat")
		} else {
			if prev != "" {
				if err = os.Rename(cur, prev); err != nil {
					return nil, errors.Wrapf(err, "rename %s => %s", cur, prev)
				}
			} else {
				if err = os.Remove(cur); err != nil {
					return nil, errors.Wrapf(err, "delete %s", cur)
				}
			}
		}
		prev = cur
	}

	f, err := os.OpenFile(prev, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return nil, errors.Wrapf(err, "open %s", prev)
	}
	f.Close()

	return logger.NewFileLogger(prev), nil
}
