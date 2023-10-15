//go:build !(production || debug)

package singleton

import (
	"context"

	"github.com/wailsapp/wails/v2/pkg/logger"
)

func TrySend(ctx context.Context, l logger.Logger, messages [][]byte) (done bool, err error) {
	return false, nil
}

func RunReceiver(ctx context.Context, l logger.Logger, recv chan<- []byte) error {
	return nil
}
