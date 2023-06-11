GO ?= go
GOPATH ?= $(shell $(GO) env GOPATH)
WAILS ?= $(GOPATH)/bin/wails

FRONT_DIR = ./frontend
SKIP_FRONT ?=

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
LINUX_ARCH = amd64
WIN_ARCH = amd64
DARWIN_ARCH = amd64 arm64 universal

.PHONY: all
all: linux win darwin

.PHONY: linux
linux: $(foreach ARCH,$(LINUX_ARCH),$(addprefix bin.linux-,$(ARCH)))

.PHONY: win
win: $(foreach ARCH,$(WIN_ARCH),$(addprefix bin.windows-,$(ARCH)))

.PHONY: darwin
darwin: $(foreach ARCH,$(DARWIN_ARCH),$(addprefix bin.darwin-,$(ARCH)))

# -o <filename>
# -s                skip build frontend
# -debug            debug information + devtools in the application window
bin.%: $(if $(SKIP_FRONT),,front)
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
