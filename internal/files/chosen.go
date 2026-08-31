package files

import (
	"log/slog"

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
	logger *slog.Logger
	files  map[string]string
}

func NewChosenRegistry(logger *slog.Logger) ChosenRegistry {
	return &chosenRegistry{logger: logger}
}

func (c *chosenRegistry) AddFile(path string) (key string) {
	//c.logger.Debug("chosenRegistry<%p>.AddFile(%v)", c, path)
	//defer func() { c.logger.Debug("chosenRegistry<%p>.AddFile(%v) -> %v", c, path, key) }()
	key = newKey()
	if c.files == nil {
		c.files = make(map[string]string)
	}
	c.files[key] = path
	return
}
func (c *chosenRegistry) AddFileWithKey(key, path string) error {
	//c.logger.Debug("chosenRegistry<%p>.AddFileWithKey(%v, %v)", c, key, path)
	//defer func() { c.logger.Debug("chosenRegistry<%p>.AddFileWithKey(%v, %v) -> %v", c, key, path, _1) }()
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
	//c.logger.Debug("chosenRegistry<%p>.Get(%v)", c, key)
	//defer func() { c.logger.Debug("chosenRegistry<%p>.Get(%v) -> %v, %v", c, key, path, ok) }()
	path, ok = c.files[key]
	return
}

func (c *chosenRegistry) Remove(key string) {
	//c.logger.Debug("chosenRegistry<%p>.Remove(%v);", c, key)
	delete(c.files, key)
}
