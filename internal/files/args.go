package files

import (
	"encoding/json"
	"fmt"
	"path/filepath"

	"github.com/pkg/errors"
)

func NormalizeArgs(args []string) (abs []string, err error) {
	var failed string
	for _, arg := range args {
		s, err := filepath.Abs(arg)
		if err != nil {
			failed += fmt.Sprintf("\n* %s - %v", arg, err)
			continue
		}
		abs = append(abs, s)
	}
	if failed != "" {
		err = errors.New("Cannot find the given files:" + failed)
	}
	return
}

type ipcMessage struct {
	Type byte
	Data []byte
}

func ArgsToIpc(args []string) (r [][]byte, err error) {
	var b []byte
	for _, arg := range args {
		b, err = ArgToIpc(arg)
		if err != nil {
			return
		}
		r = append(r, b)
	}
	return
}
func ArgToIpc(arg string) ([]byte, error) {
	return json.Marshal(&ipcMessage{
		//Type: 0,
		Data: []byte(arg),
	})
}

func ArgFromIpc(data []byte) (string, error) {
	var m ipcMessage
	if err := json.Unmarshal(data, &m); err != nil {
		return "", errors.Wrap(err, "Unmarshal")
	}
	if m.Type != 0 {
		return "", errors.New("Unknown message type")
	}
	return string(m.Data), nil
}
