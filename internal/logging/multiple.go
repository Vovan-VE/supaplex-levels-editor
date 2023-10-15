package logging

import (
	"os"

	"github.com/wailsapp/wails/v2/pkg/logger"
)

func NewMultipleLogger(loggers ...logger.Logger) logger.Logger {
	return &multiple{ls: loggers}
}

type multiple struct {
	ls []logger.Logger
}

func (m *multiple) Print(message string) {
	for _, l := range m.ls {
		l.Print(message)
	}
}

func (m *multiple) Trace(message string) {
	for _, l := range m.ls {
		l.Trace(message)
	}
}

func (m *multiple) Debug(message string) {
	for _, l := range m.ls {
		l.Debug(message)
	}
}

func (m *multiple) Info(message string) {
	for _, l := range m.ls {
		l.Info(message)
	}
}

func (m *multiple) Warning(message string) {
	for _, l := range m.ls {
		l.Warning(message)
	}
}

func (m *multiple) Error(message string) {
	for _, l := range m.ls {
		l.Error(message)
	}
}

func (m *multiple) Fatal(message string) {
	for _, l := range m.ls {
		l.Error(message)
	}
	os.Exit(1)
}
