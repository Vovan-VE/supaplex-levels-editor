//go:build !windows

package singleton

import (
	"context"
	"net"
	"os"
	"path/filepath"
	"syscall"

	"github.com/adrg/xdg"
	"github.com/pkg/errors"
)

func _mkAddr(name string) string {
	return filepath.Join(xdg.RuntimeDir, name+".sock")
}

func listen(ctx context.Context, name string) (net.Listener, error) {
	path := _mkAddr(name)
	if err := os.RemoveAll(path); err != nil {
		return nil, errors.Wrap(err, "remove old")
	}
	var lc net.ListenConfig
	return lc.Listen(ctx, "unix", path)
}

func connect(ctx context.Context, name string) (net.Conn, error) {
	path := _mkAddr(name)
	if _, err := os.Stat(path); err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return nil, ErrConnectNoDestination
		}
		return nil, errors.Wrap(err, "stat")
	}
	var d net.Dialer
	conn, err := d.DialContext(ctx, "unix", path)
	if errors.Is(err, syscall.ECONNREFUSED) {
		return nil, ErrConnectNoDestination
	}
	return conn, err
}
