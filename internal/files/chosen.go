package files

import (
	"context"

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
	ctx   context.Context
	files map[string]string
}

func NewChosenRegistry(ctx context.Context) ChosenRegistry {
	return &chosenRegistry{ctx: ctx}
}

func (c *chosenRegistry) AddFile(path string) (key string) {
	//runtime.LogDebugf(c.ctx, "chosenRegistry<%p>.AddFile(%v)", c, path)
	//defer func() { runtime.LogDebugf(c.ctx, "chosenRegistry<%p>.AddFile(%v) -> %v", c, path, key) }()
	key = newKey()
	if c.files == nil {
		c.files = make(map[string]string)
	}
	c.files[key] = path
	return
}
func (c *chosenRegistry) AddFileWithKey(key, path string) error {
	//runtime.LogDebugf(c.ctx, "chosenRegistry<%p>.AddFileWithKey(%v, %v)", c, key, path)
	//defer func() { runtime.LogDebugf(c.ctx, "chosenRegistry<%p>.AddFileWithKey(%v, %v) -> %v", c, key, path, _1) }()
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
	//runtime.LogDebugf(c.ctx, "chosenRegistry<%p>.Get(%v)", c, key)
	//defer func() { runtime.LogDebugf(c.ctx, "chosenRegistry<%p>.Get(%v) -> %v, %v", c, key, path, ok) }()
	path, ok = c.files[key]
	return
}

func (c *chosenRegistry) Remove(key string) {
	//runtime.LogDebugf(c.ctx, "chosenRegistry<%p>.Remove(%v);", c, key)
	delete(c.files, key)
}
