package logging

import (
	"io"
	"log"
	"os"
)

type FileWriter struct {
	Filename string
}

var _ io.Writer = FileWriter{}

func (f FileWriter) Write(p []byte) (n int, err error) {
	file, err := os.OpenFile(f.Filename, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0o644)
	if err != nil {
		log.Fatal(err)
	}
	n, err = file.Write(p)
	if errC := file.Close(); errC != nil {
		log.Fatal(err)
	}
	return
}
