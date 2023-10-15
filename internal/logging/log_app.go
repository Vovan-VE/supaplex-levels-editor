//go:build production || debug

package logging

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/pkg/errors"
	"github.com/vovan-ve/sple-desktop/internal/config"
	"github.com/wailsapp/wails/v2/pkg/logger"
)

func GetLogger(scope Scope) logger.Logger {
	lg, err := prepareLogFile(scope)
	if err != nil {
		println("Error: get logger:", err)
		return nil
	}
	return lg
}

type rotate struct {
	name  string
	count int
}

var filenames = map[Scope]rotate{
	ScopePre:  {"pre.log", 10},
	ScopeMain: {"app.log", 5},
}

func getFileName(name string, index int) string {
	if index > 0 {
		return fmt.Sprintf("%s.%d", name, index)
	}
	return name
}

func prepareLogFile(scope Scope) (logger.Logger, error) {
	dir := config.GetLogsDir()
	if err := config.EnsureDir(dir, "logs dir"); err != nil {
		return nil, err
	}

	rot := filenames[scope]
	var prev string
	for i := rot.count; i >= 0; i-- {
		cur := filepath.Join(dir, getFileName(rot.name, i))

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

	return NewMultipleLogger(logger.NewDefaultLogger(), logger.NewFileLogger(prev)), nil
}
