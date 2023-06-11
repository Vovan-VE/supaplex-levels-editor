package config

import (
	"os"

	"github.com/pkg/errors"
)

func EnsureConfigDir(path string) error {
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
			return errors.New("config dir path is occupied by non-directory: " + path)
		}
	}
	return nil
}
