package files

import (
	"fmt"
	"path/filepath"

	"github.com/pkg/errors"
)

func NormalizeArgs(args []string) (abs []string, err error) {
	var failed string
	for _, arg := range args {
		s, err := filepath.Abs(arg)
		if err != nil {
			failed += fmt.Sprintf("\n- %s: %v", arg, err)
			continue
		}
		abs = append(abs, s)
	}
	if failed != "" {
		err = errors.New("Cannot find the given files:" + failed)
	}
	return
}

func ResolveArgs(wd string, args []string) (abs []string, err error) {
	for _, arg := range args {
		if !filepath.IsAbs(arg) {
			arg = filepath.Join(wd, arg)
		}
		abs = append(abs, arg)
	}
	return
}
