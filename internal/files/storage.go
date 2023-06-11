package files

import (
	"github.com/pkg/errors"
	"github.com/vovan-ve/sple-desktop/internal/config"
	"github.com/vovan-ve/sple-desktop/internal/helpers"
	"github.com/vovan-ve/sple-desktop/internal/storage"
)

var (
	ErrNoKey = errors.New("no such key")
)

func NewStorage(path string, chosen ChosenPicker) (storage.Full[*Record], error) {
	opt, err := config.NewFileStorage(path)
	if err != nil {
		return nil, errors.Wrap(err, "options storage")
	}
	return &fullStorage{
		opt:    opt,
		chosen: chosen,
	}, nil
}

type fullStorage struct {
	opt    storage.Full[string]
	chosen ChosenPicker
}

func (f *fullStorage) GetItem(key string) (value *Record, ok bool, err error) {
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
	err = f.opt.RemoveItem(key)
	if err != nil {
		return errors.Wrap(err, "options storage")
	}
	return nil
}

func (f *fullStorage) GetAll() (map[string]*Record, error) {
	ms, err := f.opt.GetAll()
	if err != nil {
		return nil, errors.Wrap(err, "read options storage")
	}

	mr := make(map[string]*Record)
	for k, s := range ms {
		r, err := recordFromString(k, s)
		if err != nil {
			return nil, err
		}
		mr[k] = r
	}
	return mr, nil
}

func (f *fullStorage) SetAll(all map[string]*Record) (err error) {
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
