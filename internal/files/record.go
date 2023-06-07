package files

import (
	"encoding/json"

	"github.com/pkg/errors"
	"github.com/vovan-ve/sple-desktop/internal/helpers"
)

type Record struct {
	Key     string         `json:"key"`
	Blob64  helpers.Blob64 `json:"blob64"`
	Options string         `json:"options"`
}

type entry struct {
	File    string
	Options string
}

func entryFromString(s string) (*entry, error) {
	e := new(entry)
	if err := json.Unmarshal([]byte(s), e); err != nil {
		return nil, errors.Wrap(err, "unmarshal")
	}
	return e, nil
}
func (e *entry) toString() (string, error) {
	b, err := json.Marshal(e)
	if err != nil {
		return "", errors.Wrap(err, "marshal")
	}
	return string(b), nil
}

func recordFromString(key, s string) (*Record, error) {
	e, err := entryFromString(s)
	if err != nil {
		return nil, errors.Wrap(err, "entry from string")
	}

	b, err := NewFile(e.File).Read()
	if err != nil {
		return nil, errors.Wrap(err, "read file")
	}

	return &Record{
		Key:     key,
		Blob64:  helpers.B2A(b),
		Options: e.Options,
	}, nil
}

func createString(file string, r *Record) (opt string, err error) {
	e := &entry{
		File:    file,
		Options: r.Options,
	}
	opt, err = e.toString()
	if err != nil {
		err = errors.Wrap(err, "entry to string")
		return
	}
	return
}

func replaceOptionsInString(s string, r *Record) (opt, file string, err error) {
	e, err := entryFromString(s)
	if err != nil {
		err = errors.Wrap(err, "entry from string")
		return
	}

	e.Options = r.Options
	opt, err = e.toString()
	if err != nil {
		err = errors.Wrap(err, "entry to string")
		return
	}
	file = e.File
	return
}
