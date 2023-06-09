GO ?= go
GOPATH ?= $(shell $(GO) env GOPATH)
WAILS ?= $(GOPATH)/bin/wails

FRONT_DIR = ./frontend

.PHONY: all
all:

# -platform https://wails.io/docs/reference/cli/#platforms
#   darwin/amd64
#   darwin/arm64
#   darwin/universal
#   windows/amd64
#   windows/arm64
#   linux/amd64
#   linux/arm64
#
# -o <filename>
# -s                skip build frontend
# -debug            debug information + devtools in the application window
.PHONY: bin
bin:
	make -C $(FRONT_DIR) wails-prod
	$(WAILS) build -v 2 -trimpath -s

.PHONY: bin-debug
bin-debug:
	make -C $(FRONT_DIR) wails
	$(WAILS) build -v 2 -trimpath -s -debug

.PHONY: dev
dev:
	$(WAILS) generate module
	$(WAILS) dev -skipbindings

.PHONY: clean
clean:
	rm -r build/bin
	make -C $(FRONT_DIR) clean

FORCE:
