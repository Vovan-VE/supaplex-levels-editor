package helpers

import (
	"encoding/base64"
	"encoding/json"

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

type Bytes64 struct {
	bytes []byte
}

var (
	_ json.Marshaler   = (*Bytes64)(nil)
	_ json.Unmarshaler = (*Bytes64)(nil)
)

func NewBytes64(b []byte) *Bytes64 {
	return &Bytes64{bytes: b}
}

func (b *Bytes64) Bytes() []byte {
	if b == nil {
		return nil
	}
	return b.bytes
}

func (b *Bytes64) MarshalJSON() ([]byte, error) {
	if b.bytes == nil {
		return []byte("null"), nil
	}
	r := B2A(b.bytes)
	out := append(make([]byte, 0, len(r)+2), '"')
	out = append(out, r...)
	out = append(out, '"')
	return out, nil
}

func (b *Bytes64) UnmarshalJSON(bytes []byte) error {
	n := len(bytes)
	if n == 4 && string(bytes) == "null" {
		b.bytes = nil
		return nil
	}
	if n < 2 || bytes[0] != '"' || bytes[n-1] != '"' {
		return errors.New("string expected")
	}
	out, err := a2b(bytes[1 : n-1])
	if err != nil {
		return errors.Wrap(err, "base64")
	}
	b.bytes = out
	return nil
}
