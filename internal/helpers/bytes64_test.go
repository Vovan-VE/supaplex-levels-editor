package helpers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"testing"
)

func TestB2A(t *testing.T) {
	for i, c := range []struct {
		in  []byte
		out Blob64
	}{
		{[]byte{}, ``},
		{[]byte{0}, `AA`},
		{[]byte{0, 1}, `AAE`},
		{[]byte{0, 1, 2}, `AAEC`},
		{[]byte{0, 1, 2, 3}, `AAECAw`},
		{[]byte{0, 1, 2, 3, 4}, `AAECAwQ`},
		{[]byte{253, 254, 255}, `/f7/`},
	} {
		t.Run(fmt.Sprintf("[%v]", i), func(t *testing.T) {
			out := B2A(c.in)
			if out != c.out {
				t.Errorf("mismatch:\n-expected: %s\n+given   : %s", c.out, out)
			}
		})
	}
}

func TestA2B(t *testing.T) {
	for i, c := range []struct {
		in  Blob64
		out []byte
	}{
		{``, []byte{}},
		{`AA`, []byte{0}},
		{`AAE`, []byte{0, 1}},
		{`AAEC`, []byte{0, 1, 2}},
		{`AAECAw`, []byte{0, 1, 2, 3}},
		{`AAECAwQ`, []byte{0, 1, 2, 3, 4}},
		{`/f7/`, []byte{253, 254, 255}},
	} {
		t.Run(fmt.Sprintf("[%v]", i), func(t *testing.T) {
			out, err := A2B(c.in)
			if err != nil {
				t.Fatal("error", err)
			}
			if !bytes.Equal(c.out, out) {
				t.Errorf("mismatch:\n-expected: %x\n+given   : %x", c.out, out)
			}
		})
	}
}

func TestBytes64_MarshalJSON(t *testing.T) {
	for i, c := range []struct {
		in  []byte
		out string
	}{
		{nil, `null`},
		{[]byte{}, `""`},
		{[]byte{0}, `"AA"`},
		{[]byte{0, 1}, `"AAE"`},
		{[]byte{0, 1, 2}, `"AAEC"`},
		{[]byte{0, 1, 2, 3}, `"AAECAw"`},
		{[]byte{0, 1, 2, 3, 4}, `"AAECAwQ"`},
		{[]byte{253, 254, 255}, `"/f7/"`},
	} {
		t.Run(fmt.Sprintf("[%v]", i), func(t *testing.T) {
			b := NewBytes64(c.in)
			out, err := json.Marshal(b)
			if err != nil {
				t.Fatal("error", err)
			}
			if string(out) != c.out {
				t.Errorf("mismatch:\n-expected: %s\n+given   : %s", c.out, out)
			}
		})
	}
}

func TestBytes64_UnmarshalJSON(t *testing.T) {
	for i, c := range []struct {
		in  string
		out []byte
	}{
		{`null`, nil},
		{`""`, []byte{}},
		{`"AA"`, []byte{0}},
		{`"AAE"`, []byte{0, 1}},
		{`"AAEC"`, []byte{0, 1, 2}},
		{`"AAECAw"`, []byte{0, 1, 2, 3}},
		{`"AAECAwQ"`, []byte{0, 1, 2, 3, 4}},
		{`"/f7/"`, []byte{253, 254, 255}},
	} {
		t.Run(fmt.Sprintf("[%v]", i), func(t *testing.T) {
			b := Bytes64{}
			err := json.Unmarshal([]byte(c.in), &b)
			if err != nil {
				t.Fatal("error", err)
			}
			if !bytes.Equal(c.out, b.bytes) {
				t.Errorf("mismatch:\n-expected: %x\n+given   : %x", c.out, b.bytes)
			}
		})
	}
}
