package config

import (
	"encoding/json"
	"io"
	"os"
	"sync"

	"github.com/pkg/errors"
	"github.com/vovan-ve/sple-desktop/internal/helpers"
	"github.com/vovan-ve/sple-desktop/internal/storage"
)

type Storage interface {
	storage.Full[string]
	HasFunc(func(string) (bool, error)) (bool, error)
}

func NewFileStorage(path string) (Storage, error) {
	f, err := os.OpenFile(path, os.O_RDWR|os.O_CREATE, 0644)
	if err != nil {
		return nil, errors.Wrap(err, "open file")
	}
	return &fileStorage{file: f, rw: new(sync.RWMutex)}, nil
}

type fileStorage struct {
	file *os.File
	data map[string]string
	rw   *sync.RWMutex
}

func (f *fileStorage) HasFunc(match func(v string) (bool, error)) (bool, error) {
	for _, v := range f.data {
		if ok, err := match(v); err != nil || ok {
			return ok, err
		}
	}
	return false, nil
}

func (f *fileStorage) GetItem(key string) (value string, ok bool, err error) {
	f.rw.RLock()
	defer f.rw.RUnlock()
	if err = f.read(); err != nil {
		return
	}
	value, ok = f.data[key]
	return
}

func (f *fileStorage) SetItem(key, value string) error {
	f.rw.Lock()
	defer f.rw.Unlock()
	if err := f.read(); err != nil {
		return err
	}
	if v, ok := f.data[key]; ok && v == value {
		return nil
	}
	f.data[key] = value
	return f.write()
}

func (f *fileStorage) RemoveItem(key string) error {
	f.rw.Lock()
	defer f.rw.Unlock()
	if err := f.read(); err != nil {
		return err
	}
	if _, ok := f.data[key]; !ok {
		return nil
	}
	delete(f.data, key)
	return f.write()
}

func (f *fileStorage) GetAll() (map[string]string, error) {
	f.rw.RLock()
	defer f.rw.RUnlock()
	if err := f.read(); err != nil {
		return nil, err
	}
	return helpers.CopyMap(f.data), nil
}

func (f *fileStorage) SetAll(all map[string]string) error {
	f.rw.Lock()
	defer f.rw.Unlock()
	f.data = helpers.CopyMap(all)
	return f.write()
}

func (f *fileStorage) read() error {
	if f.data != nil {
		return nil
	}
	if _, err := f.file.Seek(0, io.SeekStart); err != nil {
		return errors.Wrap(err, "seek file")
	}
	b, err := io.ReadAll(f.file)
	if err != nil {
		return errors.Wrap(err, "read file")
	}
	m := make(map[string]string)
	if len(b) > 0 {
		if err = json.Unmarshal(b, &m); err != nil {
			return errors.Wrap(err, "json unmarshal")
		}
	}
	f.data = m
	return nil
}

func (f *fileStorage) write() error {
	if f.data == nil {
		return nil
	}
	b, err := json.Marshal(f.data)
	if err != nil {
		return errors.Wrap(err, "json marshal")
	}
	if _, err = f.file.WriteAt(b, 0); err != nil {
		return errors.Wrap(err, "write file")
	}
	if err = f.file.Truncate(int64(len(b))); err != nil {
		return errors.Wrap(err, "truncate file")
	}
	if err = f.file.Sync(); err != nil {
		return errors.Wrap(err, "flush file")
	}
	return nil
}
