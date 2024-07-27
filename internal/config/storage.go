package config

import (
	"context"
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

func NewFileStorage(ctx context.Context, path string) (Storage, error) {
	f, err := os.OpenFile(path, os.O_RDWR|os.O_CREATE, 0644)
	if err != nil {
		return nil, errors.Wrap(err, "open file")
	}
	return &fileStorage{
		ctx:  ctx,
		file: f,
	}, nil
}

type fileStorage struct {
	ctx  context.Context
	file *os.File
	data map[string]string
	rw   sync.RWMutex
	rwd  sync.RWMutex
}

func (f *fileStorage) HasFunc(match func(v string) (bool, error)) (bool, error) {
	//runtime.LogDebugf(f.ctx, "fileStorage<%p>.HasFunc()", f)
	//defer func() { runtime.LogDebugf(f.ctx, "fileStorage<%p>.HasFunc() -> %v, %v", f, _1, _2) }()
	f.rw.RLock()
	defer f.rw.RUnlock()
	if err := f.read(); err != nil {
		return false, err
	}
	f.rwd.RLock()
	defer f.rwd.RUnlock()
	for _, v := range f.data {
		if ok, err := match(v); err != nil || ok {
			//runtime.LogDebugf(f.ctx, "fileStorage<%p>.HasFunc() match %v", f, v)
			return ok, err
		}
	}
	return false, nil
}

func (f *fileStorage) GetItem(key string) (value string, ok bool, err error) {
	//runtime.LogDebugf(f.ctx, "fileStorage<%p>.GetItem(%v)", f, key)
	//defer func() { runtime.LogDebugf(f.ctx, "fileStorage<%p>.GetItem(%v) -> %v, %v, %v", f, key, value, ok, err) }()
	f.rw.RLock()
	defer f.rw.RUnlock()
	if err = f.read(); err != nil {
		return
	}
	f.rwd.RLock()
	defer f.rwd.RUnlock()
	value, ok = f.data[key]
	return
}

// FIXME: parallel SetItem/RemoveItem(key1) locks will unlock in undefined
//  order, so sequence for `key1` is broken, and stored value is outdated.
//  Workaround by `flushDelay` at frontend

func (f *fileStorage) SetItem(key, value string) error {
	//runtime.LogDebugf(f.ctx, "fileStorage<%p>.SetItem(%v, %v)", f, key, value)
	//defer func() { runtime.LogDebugf(f.ctx, "fileStorage<%p>.SetItem(%v, %v) -> %v", f, key, value, _1) }()
	f.rw.Lock()
	defer f.rw.Unlock()
	if err := f.read(); err != nil {
		return err
	}
	f.rwd.Lock()
	defer f.rwd.Unlock()
	if v, ok := f.data[key]; ok && v == value {
		return nil
	}
	f.data[key] = value
	return f.write()
}

func (f *fileStorage) RemoveItem(key string) error {
	//runtime.LogDebugf(f.ctx, "fileStorage<%p>.RemoveItem(%v)", f, key)
	//defer func() { runtime.LogDebugf(f.ctx, "fileStorage<%p>.RemoveItem(%v) -> %v", f, key, _1) }()
	f.rw.Lock()
	defer f.rw.Unlock()
	if err := f.read(); err != nil {
		return err
	}
	f.rwd.Lock()
	defer f.rwd.Unlock()
	if _, ok := f.data[key]; !ok {
		return nil
	}
	delete(f.data, key)
	return f.write()
}

func (f *fileStorage) GetAll() (map[string]string, error) {
	//runtime.LogDebugf(f.ctx, "fileStorage<%p>.GetAll()", f)
	//defer func() { runtime.LogDebugf(f.ctx, "fileStorage<%p>.GetAll() -> %v, %v", f, mpretty(_1), _2) }()
	f.rw.RLock()
	defer f.rw.RUnlock()
	if err := f.read(); err != nil {
		return nil, err
	}
	f.rwd.RLock()
	defer f.rwd.RUnlock()
	return helpers.CopyMap(f.data), nil
}

func (f *fileStorage) SetAll(all map[string]string) error {
	//runtime.LogDebugf(f.ctx, "fileStorage<%p>.SetAll(%v)", f, mpretty(all))
	//defer func() { runtime.LogDebugf(f.ctx, "fileStorage<%p>.SetAll(%v) -> %v", f, mpretty(all), _1) }()
	f.rw.Lock()
	defer f.rw.Unlock()
	f.rwd.Lock()
	defer f.rwd.Unlock()
	f.data = helpers.CopyMap(all)
	return f.write()
}

func (f *fileStorage) read() error {
	//runtime.LogDebugf(f.ctx, "fileStorage<%p>.read()", f)
	//defer func() { runtime.LogDebugf(f.ctx, "fileStorage<%p>.read() -> %v", f, _1) }()
	f.rwd.Lock()
	defer f.rwd.Unlock()
	if f.data != nil {
		//runtime.LogDebugf(f.ctx, "fileStorage<%p>.read(): already was read", f)
		return nil
	}
	if _, err := f.file.Seek(0, io.SeekStart); err != nil {
		return errors.Wrap(err, "seek file")
	}
	b, err := io.ReadAll(f.file)
	if err != nil {
		return errors.Wrap(err, "read file")
	}
	//runtime.LogDebugf(f.ctx, "fileStorage<%p>.read(): raw=%s", f, bshort(b))
	m := make(map[string]string)
	if len(b) > 0 {
		if err = json.Unmarshal(b, &m); err != nil {
			return errors.Wrap(err, "json unmarshal")
		}
	}
	//runtime.LogDebugf(f.ctx, "fileStorage<%p>.read(): m=%v", f, mpretty(m))
	f.data = m
	return nil
}

func (f *fileStorage) write() error {
	//runtime.LogDebugf(f.ctx, "fileStorage<%p>.write()", f)
	//defer func() { runtime.LogDebugf(f.ctx, "fileStorage<%p>.write() -> %v", f, _1) }()
	if f.data == nil {
		//runtime.LogDebugf(f.ctx, "fileStorage<%p>.write(): no data, nothing to write", f)
		return nil
	}
	//runtime.LogDebugf(f.ctx, "fileStorage<%p>.write(): m=%s", f, mpretty(f.data))
	b, err := json.Marshal(f.data)
	if err != nil {
		return errors.Wrap(err, "json marshal")
	}
	//runtime.LogDebugf(f.ctx, "fileStorage<%p>.write(): raw=%s", f, bshort(b))
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

//func bshort(b []byte) string {
//	const pre = 20
//	const post = 20
//	if len(b) <= pre+post+5 {
//		return string(b)
//	}
//	return string(b[:pre]) + "..." + string(b[len(b)-post:])
//}
//
//func mpretty[K comparable, V any](m map[K]V) string {
//	result := fmt.Sprintf("%T", m)
//	if m == nil {
//		return result + "(nil)"
//	}
//	for k, v := range m {
//		result += fmt.Sprintf("\n\t%v: %v", k, v)
//	}
//	if len(m) != 0 {
//		result += "\n"
//	}
//	result += "}"
//	return result
//}
