package backend

import (
	"github.com/vovan-ve/sple-desktop/internal/storage"
)

type ConfigStorage struct {
	F func() storage.Full[string]
}

func (s *ConfigStorage) GetItem(key string) (*StringRef, error) {
	v, ok, err := s.F().GetItem(key)
	if err != nil || !ok {
		return nil, err
	}
	return &StringRef{Value: v}, nil
}

func (s *ConfigStorage) SetItem(key string, value string) error {
	return s.F().SetItem(key, value)
}

func (s *ConfigStorage) RemoveItem(key string) error {
	return s.F().RemoveItem(key)
}

//func (s *ConfigStorage) GetAll() (map[string]string, error) {
//	return s.F().GetAll()
//}
//
//func (s *ConfigStorage) SetAll(all map[string]string) error {
//	return s.F().SetAll(all)
//}

type StringRef struct {
	Value string `json:"value"`
}
