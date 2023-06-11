package files

import (
	"github.com/pkg/errors"
)

type ChosenAdder interface {
	AddFile(path string) (key string)
	AddFileWithKey(key, path string) error
}
type ChosenPicker interface {
	Get(key string) (path string, ok bool)
	Remove(key string)
}
type ChosenRegistry interface {
	ChosenAdder
	ChosenPicker
}

type chosenRegistry struct {
	files map[string]string
}

func NewChosenRegistry() ChosenRegistry {
	return &chosenRegistry{}
}

func (c *chosenRegistry) AddFile(path string) (key string) {
	key = newKey()
	if c.files == nil {
		c.files = make(map[string]string)
	}
	c.files[key] = path
	return
}
func (c *chosenRegistry) AddFileWithKey(key, path string) error {
	if c.files == nil {
		c.files = make(map[string]string)
	} else {
		if key == "" {
			return errors.New("invalid key")
		}
		if _, exists := c.files[key]; exists {
			return errors.New("key exists")
		}
	}
	c.files[key] = path
	return nil
}

func (c *chosenRegistry) Get(key string) (path string, ok bool) {
	path, ok = c.files[key]
	return
}

func (c *chosenRegistry) Remove(key string) {
	delete(c.files, key)
}
