package backend

import (
	"github.com/vovan-ve/sple-desktop/internal/files"
	"github.com/vovan-ve/sple-desktop/internal/storage"
)

type FilesStorage struct {
	F     func() storage.Full[*files.Record]
	Catch func()
}

func (f *FilesStorage) GetItem(key string) (value *files.Record, err error) {
	defer f.Catch()
	r, ok, err := f.F().GetItem(key)
	if err != nil || !ok {
		return nil, err
	}
	return r, nil
}

func (f *FilesStorage) SetItem(key string, value *files.Record) error {
	defer f.Catch()
	return f.F().SetItem(key, value)
}

func (f *FilesStorage) RemoveItem(key string) error {
	defer f.Catch()
	return f.F().RemoveItem(key)
}

func (f *FilesStorage) GetAll() (map[string]*files.Record, error) {
	defer f.Catch()
	return f.F().GetAll()
}

func (f *FilesStorage) SetAll(all map[string]*files.Record) error {
	defer f.Catch()
	return f.F().SetAll(all)
}
