package backend

type FrontEvent struct {
	Type string `json:"type"`
	Data any    `json:"data"`
}

const (
	FEExitDirty = "exitDirty"
	FEShowError = "showError"
)
