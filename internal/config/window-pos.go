package config

import (
	"encoding/json"
)

type WindowPlacement struct {
	X, Y, W, H int
	IsMax      bool
}

var default_ = WindowPlacement{X: 0, Y: 0, W: 1024, H: 768, IsMax: true}

func WindowPlacementFromString(s string) WindowPlacement {
	if s == "" {
		return default_
	}
	var p WindowPlacement
	if err := json.Unmarshal([]byte(s), &p); err != nil {
		// TODO: log
		return default_
	}
	return p
}

func (w WindowPlacement) String() string {
	b, err := json.Marshal(&w)
	if err != nil {
		// TODO: log
		return ""
	}
	return string(b)
}
