package config

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/adrg/xdg"
	"github.com/pkg/errors"
)

const appSubdir = "sple"

func GetConfigsDir() string { return filepath.Join(xdg.ConfigHome, appSubdir) }
func GetLogsDir() string    { return filepath.Join(xdg.DataHome, appSubdir) }

func ReportInfo() string {
	return fmt.Sprintf(
		`Dirs:
    Configs: %s
    Logs   : %s
`,
		GetConfigsDir(),
		GetLogsDir(),
	)
}

func ensureDir(path string) error {
	s, err := os.Stat(path)
	if os.IsNotExist(err) {
		err = os.Mkdir(path, 0755)
		if err != nil {
			return errors.Wrap(err, "mkdir")
		}
	} else {
		if err != nil {
			return errors.Wrap(err, "stat")
		}
		if !s.IsDir() {
			return errors.New("path is occupied by non-directory: " + path)
		}
	}
	return nil
}

func EnsureDir(path, errPrefix string) error {
	if err := ensureDir(path); err != nil {
		return errors.Wrap(err, errPrefix)
	}
	return nil
}
