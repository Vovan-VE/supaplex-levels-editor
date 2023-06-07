package backend

import (
	"github.com/vovan-ve/sple-desktop/internal/files"
	"github.com/vovan-ve/sple-desktop/internal/helpers"
)

type Interface interface {
	CreateFile(key string, baseFileName string) (ok bool, err error)
	OpenFile(multiple bool) []*WebFileRef
	SaveFileAs(blob64 helpers.Blob64, baseFileName string)

	SetIsDirty(isDirty bool)
}

type WebFileRef = files.WebFileRef
