package files

import (
	"context"
	"os"

	"github.com/pkg/errors"
	"github.com/vovan-ve/sple-desktop/internal/config"
	"github.com/vovan-ve/sple-desktop/internal/helpers"
	"github.com/vovan-ve/sple-desktop/internal/storage"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

var (
	ErrNoKey = errors.New("no such key")
)

type Storage interface {
	storage.Full[*Record]
	HasFile(filename string) (bool, error)
}

func NewStorage(ctx context.Context, path string, chosen ChosenPicker) (Storage, error) {
	opt, err := config.NewFileStorage(ctx, path)
	if err != nil {
		return nil, errors.Wrap(err, "options storage")
	}
	return &fullStorage{
		ctx:    ctx,
		opt:    opt,
		chosen: chosen,
	}, nil
}

type fullStorage struct {
	ctx    context.Context
	opt    config.Storage
	chosen ChosenPicker
}

func (f *fullStorage) HasFile(filename string) (bool, error) {
	//runtime.LogDebugf(f.ctx, "fullStorage<%p>.HasFile(%v)", f, filename)
	//defer func() { runtime.LogDebugf(f.ctx, "fullStorage<%p>.HasFile(%v) -> %v, %v", f, filename, _1, _2) }()
	return f.opt.HasFunc(func(s string) (bool, error) {
		e, err := entryFromString(s)
		if err != nil {
			return false, errors.Wrap(err, "entry from string")
		}
		return e.File == filename, nil
	})
}

func (f *fullStorage) GetItem(key string) (value *Record, ok bool, err error) {
	//runtime.LogDebugf(f.ctx, "fullStorage<%p>.GetItem(%v)", f, key)
	//defer func() { runtime.LogDebugf(f.ctx, "fullStorage<%p>.GetItem(%v) -> %v, %v, %v", f, key, value, ok, err) }()
	var s string
	s, ok, err = f.opt.GetItem(key)
	if err != nil {
		err = errors.Wrap(err, "options storage")
		return
	}
	if !ok {
		return
	}

	value, err = recordFromString(key, s)
	if err != nil {
		return
	}
	ok = true
	return
}

func (f *fullStorage) SetItem(key string, value *Record) (err error) {
	//runtime.LogDebugf(f.ctx, "fullStorage<%p>.SetItem(%v, %v)", f, key, value)
	//defer func() { runtime.LogDebugf(f.ctx, "fullStorage<%p>.SetItem(%v, %v) -> %v", f, key, value, err) }()
	s, ok, err := f.opt.GetItem(key)
	if err != nil {
		return errors.Wrap(err, "read options storage")
	}
	var file string
	if ok {
		s, file, err = replaceOptionsInString(s, value)
	} else {
		if file, ok = f.chosen.Get(key); !ok {
			return ErrNoKey
		}
		defer func() {
			if err == nil {
				f.chosen.Remove(key)
			}
		}()
		s, err = createString(file, value)
	}
	if err != nil {
		return errors.Wrap(err, "entry to string")
	}

	blob, err := helpers.A2B(value.Blob64)
	if err != nil {
		return errors.Wrap(err, "blob decode")
	}

	err = NewFile(file).Write(blob)
	if err != nil {
		return errors.Wrap(err, "write file")
	}

	err = f.opt.SetItem(key, s)
	if err != nil {
		return errors.Wrap(err, "write options storage")
	}
	return nil
}

func (f *fullStorage) RemoveItem(key string) (err error) {
	//runtime.LogDebugf(f.ctx, "fullStorage<%p>.RemoveItem(%v)", f, key)
	//defer func() { runtime.LogDebugf(f.ctx, "fullStorage<%p>.RemoveItem(%v) -> %v", f, key, err) }()
	err = f.opt.RemoveItem(key)
	if err != nil {
		return errors.Wrap(err, "options storage")
	}
	return nil
}

func (f *fullStorage) GetAll() (map[string]*Record, error) {
	//runtime.LogDebugf(f.ctx, "fullStorage<%p>.GetAll()", f)
	//defer func() { runtime.LogDebugf(f.ctx, "fullStorage<%p>.GetAll() -> %v, %v", f, _1, _2) }()
	ms, err := f.opt.GetAll()
	if err != nil {
		return nil, errors.Wrap(err, "read options storage")
	}

	mr := make(map[string]*Record)
	for k, s := range ms {
		r, err := recordFromString(k, s)
		if err != nil {
			runtime.LogErrorf(f.ctx, "Cannot read file item: %v", err)
			var pe *os.PathError
			if errors.As(err, &pe) {
				runtime.LogWarningf(f.ctx, "Remove bad item for file %s", pe.Path)
				if err = f.opt.RemoveItem(k); err != nil {
					runtime.LogErrorf(f.ctx, "Cannot remove file item from files registry: %v", err)
				}
			}
			continue
		}
		mr[k] = r
	}
	return mr, nil
}

func (f *fullStorage) SetAll(all map[string]*Record) (err error) {
	//runtime.LogDebugf(f.ctx, "fullStorage<%p>.SetAll(%v)", f, all)
	//defer func() { runtime.LogDebugf(f.ctx, "fullStorage<%p>.SetAll(%v) -> %v", f, all, err) }()
	hasMs, err := f.opt.GetAll()
	if err != nil {
		return errors.Wrap(err, "read options storage")
	}

	var chosenKeys []string
	defer func() {
		if err == nil {
			for _, k := range chosenKeys {
				f.chosen.Remove(k)
			}
		}
	}()

	newMs := make(map[string]string)
	fs := make(map[string][]byte)
	for k, r := range all {
		s, ok := hasMs[k]
		var file string
		if ok {
			s, file, err = replaceOptionsInString(s, r)
		} else {
			if file, ok = f.chosen.Get(k); !ok {
				return ErrNoKey
			}
			chosenKeys = append(chosenKeys, k)
			s, err = createString(file, r)
		}
		if err != nil {
			return errors.Wrap(err, "entry to string")
		}

		blob, err := helpers.A2B(r.Blob64)
		if err != nil {
			return errors.Wrap(err, "blob decode")
		}

		newMs[k] = s
		fs[file] = blob
	}

	for file, b := range fs {
		if err = NewFile(file).Write(b); err != nil {
			return errors.Wrap(err, "write file")
		}
	}
	if err = f.opt.SetAll(newMs); err != nil {
		return errors.Wrap(err, "write options storage")
	}
	return nil
}
