package files

import (
	"bytes"
	"io"
	"os"

	"github.com/pkg/errors"
)

type File struct {
	path string
}

func NewFile(path string) *File { return &File{path: path} }

func (f *File) Path() string { return f.path }

func (f *File) Read() ([]byte, error) {
	file, err := os.Open(f.path)
	if err != nil {
		return nil, errors.Wrap(err, "open file")
	}
	defer file.Close()

	b, err := io.ReadAll(file)
	if err != nil {
		return nil, errors.Wrap(err, "read file")
	}
	return b, nil
}

func (f *File) Write(b []byte) error {
	file, err := os.OpenFile(f.path, os.O_RDWR|os.O_CREATE, 0644)
	if err != nil {
		return errors.Wrap(err, "open file")
	}
	defer file.Close()

	if s, err := file.Stat(); err == nil && s.Size() == int64(len(b)) {
		if old, err := io.ReadAll(file); err == nil && bytes.Equal(old, b) {
			return nil
		}
		if _, err = file.Seek(0, io.SeekStart); err != nil {
			return errors.Wrap(err, "seek file")
		}
	}

	if _, err = file.WriteAt(b, 0); err != nil {
		return errors.Wrap(err, "write file")
	}
	if err = file.Truncate(int64(len(b))); err != nil {
		return errors.Wrap(err, "truncate file")
	}
	if err = file.Sync(); err != nil {
		return errors.Wrap(err, "flush file")
	}
	return nil
}
