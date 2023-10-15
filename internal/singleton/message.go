package singleton

import (
	"bytes"
	"io"
	"unsafe"

	"github.com/pkg/errors"
)

//  01 00  02 00 00 00  ...
//  -----  -----------  ----
//  ver    data length  data

const (
	version uint16 = 1

	sizeOfVersion = 2
	sizeOfLength  = 4

	headerSize    = sizeOfVersion + sizeOfLength
	maxDataLength = 1<<20 - headerSize
)

var ErrVersionUnsupported = errors.New("Unsupported version")
var ErrTooLarge = errors.New("Too large message")
var ErrCorrupted = errors.New("Message corrupted")

type Message struct {
	Data []byte
}

func NewMessage(data []byte) *Message { return &Message{Data: data} }

var _ io.WriterTo = (*Message)(nil)

func (m *Message) WriteTo(w io.Writer) (n int64, err error) {
	length := len(m.Data)
	if length > maxDataLength {
		return 0, ErrTooLarge
	}

	b := new(bytes.Buffer)
	b.Grow(headerSize + length)

	if err = writeUint16(b, version); err != nil {
		return
	}

	if err = writeUint32(b, uint32(length)); err != nil {
		return
	}

	if _, err = b.Write(m.Data); err != nil {
		return
	}

	return b.WriteTo(w)
}

func ReadMessage(r io.Reader) (*Message, error) {
	ver, err := readUint16(r)
	if err != nil {
		return nil, err
	}
	if ver != version {
		return nil, ErrVersionUnsupported
	}

	length, err := readUint32(r)
	if err != nil {
		return nil, err
	}
	if length > maxDataLength {
		return nil, ErrTooLarge
	}

	data := make([]byte, length)
	if _, err = io.ReadFull(r, data); err != nil {
		return nil, ErrCorrupted
	}

	return NewMessage(data), nil
}

func uint16ToBytes(v *uint16) []byte { return (*[2]byte)(unsafe.Pointer(v))[:] }
func uint32ToBytes(v *uint32) []byte { return (*[4]byte)(unsafe.Pointer(v))[:] }

func readUint16(r io.Reader) (v uint16, err error) {
	_, err = io.ReadFull(r, uint16ToBytes(&v))
	return
}
func readUint32(r io.Reader) (v uint32, err error) {
	_, err = io.ReadFull(r, uint32ToBytes(&v))
	return
}

func writeUint16(w io.Writer, v uint16) error {
	_, err := w.Write(uint16ToBytes(&v))
	return err
}
func writeUint32(w io.Writer, v uint32) error {
	_, err := w.Write(uint32ToBytes(&v))
	return err
}
