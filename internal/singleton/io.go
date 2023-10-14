package singleton

import (
	"context"
	"fmt"
	"io"
	"net"
	"time"

	"github.com/pkg/errors"
	"github.com/wailsapp/wails/v2/pkg/logger"
)

var (
	ErrConnectNoDestination = errors.New("no destination")
)

const (
	name = "sple-ipc-v1"
)

func trySend(ctx context.Context, l logger.Logger, messages [][]byte) (done bool, err error) {
	ctxTimeout, cancel := context.WithTimeout(ctx, 1*time.Second)
	defer cancel()

	l.Debug("IPC connecting")
	conn, err := connect(ctxTimeout, name)
	if errors.Is(err, ErrConnectNoDestination) {
		l.Debug("IPC no primary accessible")
		return false, nil
	}
	if err != nil {
		l.Debug("IPC failed to connect")
		return false, errors.Wrap(err, "connect")
	}
	defer conn.Close()
	l.Debug("IPC connected")

	done = true
	for _, data := range messages {
		if len(data) > 0 {
			l.Debug(fmt.Sprintf("IPC send message: %s", string(data)))
			_, err = NewMessage(data).WriteTo(conn)
			if err != nil {
				return done, errors.Wrap(err, "Write")
			}
		}
	}
	return
}

func runReceiver(ctx context.Context, l logger.Logger, recv chan<- []byte) error {
	l.Debug("IPC start listen")
	listener, err := listen(ctx, name)
	if err != nil {
		l.Debug("IPC failed to listen")
		return errors.Wrap(err, "listen")
	}
	defer listener.Close()
	l.Debug("IPC listening ok")
	defer l.Debug("IPC listening end")

	done := make(chan error)
	go func() {
		defer close(done)
		done <- errors.Wrap(acceptLoop(ctx, listener, l, recv), "acceptLoop")
	}()
	return <-done
}

func acceptLoop(ctx context.Context, listener net.Listener, l logger.Logger, recv chan<- []byte) error {
	l.Debug("IPC accept loop")
	for {
		select {
		case <-ctx.Done():
			l.Debug("IPC accept context done")
			return ctx.Err()
		default:
		}

		l.Debug("IPC accept waiting a client")
		conn, err := listener.Accept()
		if err != nil {
			l.Debug("IPC accept failed")
			return errors.Wrap(err, "Accept")
		}
		l.Debug("IPC accepted a client")
		if err = conn.SetDeadline(time.Now().Add(1 * time.Second)); err != nil {
			return errors.Wrap(err, "SetDeadline")
		}
		if err = drainClient(ctx, conn, l, recv); err != nil {
			return errors.Wrap(err, "drainClient")
		}
	}
}

func drainClient(ctx context.Context, conn net.Conn, l logger.Logger, recv chan<- []byte) error {
	l.Debug("IPC draining a client")
	defer l.Debug("IPC end draining client")
	defer conn.Close()
	for {
		select {
		case <-ctx.Done():
			l.Debug("IPC draining context done")
			return ctx.Err()
		default:
		}

		l.Debug("IPC reading from client")
		msg, err := ReadMessage(conn)
		if errors.Is(err, io.EOF) || errors.Is(err, io.ErrUnexpectedEOF) {
			l.Debug("IPC reading completed")
			return nil
		}
		if err != nil {
			l.Debug("IPC reading failed")
			return errors.Wrap(err, "read message")
		}
		l.Debug(fmt.Sprintf("IPC read message: %s", string(msg.Data)))
		recv <- msg.Data
	}
}
