GO ?= go
GOPATH ?= $(shell $(GO) env GOPATH)
WAILS ?= $(GOPATH)/bin/wails

FRONT_DIR = ./frontend

FRONT_TARGET = wails-prod
BUILD_ARGS =
FILE_NAME = sple
FILE_TAG =
ifneq ($(DEBUG),)
  FRONT_TARGET = wails
  BUILD_ARGS = -debug
  FILE_TAG = "[debug]"
endif

# -platform https://wails.io/docs/reference/cli/#platforms
#   darwin/amd64
#   darwin/arm64
#   darwin/universal
#   windows/amd64
#   windows/arm64
#   linux/amd64
#   linux/arm64
PLATFORMS = linux-amd64 windows-amd64

.PHONY: all
all: bin

.PHONY: bin
bin: $(foreach P,$(PLATFORMS),$(addprefix bin.,$(P)))

# -o <filename>
# -s                skip build frontend
# -debug            debug information + devtools in the application window
bin.%: front
	$(WAILS) build -v 2 -trimpath -s $(BUILD_ARGS) \
	  -platform $(subst -,/,$*) \
	  -o "$(FILE_NAME)-$*$(FILE_TAG)$(if $(findstring windows,$*),.exe)" \

.PHONY: front
front:
	make -C $(FRONT_DIR) $(FRONT_TARGET)

.PHONY: clean
clean:
	rm -rf build/bin
	make -C $(FRONT_DIR) clean

FORCE:
