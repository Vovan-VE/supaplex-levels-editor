package singleton

import (
	"context"
	"net"
	"os"

	"github.com/Microsoft/go-winio"
	"github.com/pkg/errors"
)

func _mkAddr(name string) string { return `\\.\pipe\` + name }

func listen(ctx context.Context, name string) (net.Listener, error) {
	return winio.ListenPipe(_mkAddr(name), nil)
}

func connect(ctx context.Context, name string) (net.Conn, error) {
	p, err := winio.DialPipeContext(ctx, _mkAddr(name))
	if err != nil {
		if _, ok := err.(*os.PathError); ok {
			return nil, ErrConnectNoDestination
		}
		return nil, errors.Wrap(err, "dial pipe")
	}
	return p, nil
}
