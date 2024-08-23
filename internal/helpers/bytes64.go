package helpers

import (
	"encoding/base64"

	"github.com/pkg/errors"
)

type Blob64 = string

func B2A(b []byte) Blob64 {
	n := base64.RawStdEncoding.EncodedLen(len(b))
	out := make([]byte, n)
	base64.RawStdEncoding.Encode(out, b)
	return string(out)
}
func A2B(b Blob64) ([]byte, error) {
	return a2b([]byte(b))
}
func a2b(b []byte) ([]byte, error) {
	out := make([]byte, base64.RawStdEncoding.DecodedLen(len(b)))
	i, err := base64.RawStdEncoding.Decode(out, b)
	if err != nil {
		return nil, errors.Wrap(err, "base64")
	}
	return out[:i], err
}
