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

const (
	IpcMessageOpenFile = iota
	IpcMessageActivate
)

type IpcMessage struct {
	Type byte
	Data []byte
}

func (i *IpcMessage) String() string {
	switch i.Type {
	case IpcMessageOpenFile:
		return fmt.Sprintf("{OpenFile<%s>}", string(i.Data))
	case IpcMessageActivate:
		return "{Activate}"
	}
	b, err := json.Marshal(i)
	if err != nil {
		return fmt.Sprintf("E<cannot marshal %T: %v>", i, err)
	}
	return string(b)
}

func ArgsToIpc(args []string) (r [][]byte, err error) {
	var b []byte
	for _, arg := range args {
		b, err = ArgToIpc(&IpcMessage{
			Type: IpcMessageOpenFile,
			Data: []byte(arg),
		})
		if err != nil {
			return
		}
		r = append(r, b)
	}

	b, err = ArgToIpc(&IpcMessage{
		Type: IpcMessageActivate,
	})
	if err != nil {
		return
	}
	r = append(r, b)

	return
}
func ArgToIpc(msg *IpcMessage) ([]byte, error) {
	return json.Marshal(msg)
}

func MessageFromIpc(data []byte) (*IpcMessage, error) {
	var m IpcMessage
	if err := json.Unmarshal(data, &m); err != nil {
		return nil, errors.Wrap(err, "Unmarshal")
	}
	return &m, nil
}
