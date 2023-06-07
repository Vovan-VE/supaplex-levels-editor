package files

import (
	"github.com/vovan-ve/sple-desktop/internal/helpers"
)

type WebFileRef struct {
	ID     string         `json:"$$id"`
	Blob64 helpers.Blob64 `json:"$$blob64"`
	Path   string         `json:"-"`
	Name   string         `json:"name"`
	Size   int64          `json:"size"`
}
