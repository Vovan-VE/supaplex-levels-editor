package files

import (
	"crypto/rand"
	"fmt"
	"time"
)

var (
	lastTime  int64
	lastIndex int16
)

func newKey() string {
	t := time.Now().UnixMilli()
	if t == lastTime {
		lastIndex++
	} else {
		lastTime = t
		lastIndex = 0
	}

	buf := make([]byte, 3)
	if _, err := rand.Read(buf); err != nil {
		panic(err)
	}
	return fmt.Sprintf("%v.%v.%x", t, lastIndex, buf)
}
