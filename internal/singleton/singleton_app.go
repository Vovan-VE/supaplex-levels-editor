//go:build production || debug

package singleton

import (
	"context"
	"fmt"

	"github.com/wailsapp/wails/v2/pkg/logger"
)

func TrySend(ctx context.Context, l logger.Logger, messages [][]byte) (done bool, err error) {
	l.Debug(fmt.Sprintf("IPC TrySend: %d messages", len(messages)))
	done, err = trySend(ctx, l, messages)
	l.Debug(fmt.Sprintf("IPC TrySend result: %v, %T %+v", done, err, err))
	return done, err
}

func RunReceiver(ctx context.Context, l logger.Logger, recv chan<- []byte) error {
	l.Debug("IPC RunReceiver")
	err := runReceiver(ctx, l, recv)
	l.Debug(fmt.Sprintf("IPC RunReceiver result: %T %+v", err, err))
	return err
}
