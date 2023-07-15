package backend

import (
	"github.com/vovan-ve/sple-desktop/internal/storage"
)

type ConfigStorage struct {
	F     func() storage.Full[string]
	Catch func()
}

func (s *ConfigStorage) GetItem(key string) (*StringRef, error) {
	defer s.Catch()
	v, ok, err := s.F().GetItem(key)
	if err != nil || !ok {
		return nil, err
	}
	return &StringRef{Value: v}, nil
}

func (s *ConfigStorage) SetItem(key string, value string) error {
	defer s.Catch()
	return s.F().SetItem(key, value)
}

func (s *ConfigStorage) RemoveItem(key string) error {
	defer s.Catch()
	return s.F().RemoveItem(key)
}

//func (s *ConfigStorage) GetAll() (map[string]string, error) {
//	defer s.Catch()
//	return s.F().GetAll()
//}
//
//func (s *ConfigStorage) SetAll(all map[string]string) error {
//	defer s.Catch()
//	return s.F().SetAll(all)
//}

type StringRef struct {
	Value string `json:"value"`
}
