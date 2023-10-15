GO ?= go
GOPATH ?= $(shell $(GO) env GOPATH)
WAILS ?= $(GOPATH)/bin/wails

RUN_OS := $(shell $(GO) env GOOS)
RUN_ARCH := $(shell $(GO) env GOARCH)

FRONT_DIR := ./frontend
VERSION ?= $(shell $(MAKE) -C $(FRONT_DIR) -s get-version)
BIN_DIR := build/bin
SKIP_FRONT ?=
SKIP_FRONT_CLEAN ?= $(SKIP_FRONT)
SKIP_DEBUG ?=
SKIP_ZIP ?=
SKIP_PKG ?=

ifeq (,$(SKIP_PKG_NSIS))
  NSIS ?= makensis
  SKIP_PKG_NSIS ?= $(if $(shell $(NSIS) -VERSION),,1)
endif
ifeq (,$(SKIP_PKG_DEB))
  SKIP_PKG_DEB ?= $(if $(shell dpkg-deb --version),,1)
endif

APP_BASENAME := sple
# -noPackage cause missing ico & info in windows exe
BUILD_ARGS := -v 2 -trimpath -s
ifneq ($(DEBUG),)
  BUILD_ARGS += -debug
endif

WAILS_GO_PATH = $(shell $(GO) list -f "{{.Dir}}" github.com/wailsapp/wails/v2)
WAILS_WV2_PATH := internal/webview2runtime/MicrosoftEdgeWebview2Setup.exe
WV2_SRC = $(WAILS_GO_PATH)/$(WAILS_WV2_PATH)
WV2_DIR = build/windows/installer/tmp
WV2_DEST = $(WV2_DIR)/MicrosoftEdgeWebview2Setup.exe

# REFACT: make >= 4.4: $(let ...)
# $(call INNER_BIN_NAME_3,<OS>,<ARCH>[,<TAGS>[,<.EXT>]])
INNER_BIN_NAME_3 = $(1)/$(APP_BASENAME)-$(2)$(if $(DEBUG),-debug)$(foreach TAG,$(strip $(3)),-$(TAG))$(if $(4),$(4),$(if $(filter windows,$(1)),.exe))
# $(call INNER_BIN_NAME_2,<OS> <ARCH>[,<TAGS>[,<.EXT>]])
INNER_BIN_NAME_2 = $(call INNER_BIN_NAME_3,$(firstword $(1)),$(lastword $(1)),$(2),$(3))
# $(call INNER_BIN_NAME,<PLATFORM>)
# $(call INNER_BIN_NAME,<OS>/<ARCH>)
INNER_BIN_NAME = $(call INNER_BIN_NAME_2,$(subst /, ,$(1)))

# $(call RESULT_BIN_NAME,<PLATFORM>)
# $(call RESULT_BIN_NAME,<OS>/<ARCH>)
RESULT_BIN_NAME = $(BIN_DIR)/$(APP_BASENAME)-$(subst /,-,$(1))-v$(VERSION)$(if $(DEBUG),-debug)
RESULT_BIN_NAME_ZIP = $(call RESULT_BIN_NAME,$(1)).zip
# $(call RESULT_BIN_NAME_WINDOWS_PKG,<ARCH>)
RESULT_BIN_NAME_WINDOWS_PKG = $(call RESULT_BIN_NAME,windows/$(1))-installer.exe
# $(call RESULT_BIN_NAME_LINUX_DEB,<ARCH>)
RESULT_BIN_NAME_LINUX_DEB = $(call RESULT_BIN_NAME,linux/$(1)).deb

# -platform https://wails.io/docs/reference/cli/#platforms
#   darwin/amd64
#   darwin/arm64
#   darwin/universal
#   windows/amd64
#   windows/arm64
#   linux/amd64
#   linux/arm64

KNOW_OS := linux windows darwin

ARCH_UC_amd64 = AMD64
ARCH_UC_arm64 = ARM64

#CROSS_OS_ON_<os> := <os> ...
CROSS_OS_ON_linux := windows
# probably, `windows` can build `linux` symmetrically, but I didn't check it
CROSS_OS_ON_windows :=
CROSS_OS_ON_darwin :=

#CROSS_ARCH_ON_<run_os>_<run_arch> := <arch> ...

# usage: $(call AVAILABLE_PLATFORM,os list)
AVAILABLE_PLATFORM = $(strip \
    $(foreach \
        OS,\
        $(filter $(KNOW_OS),$(1)),\
        $(foreach \
            ARCH,\
            $(RUN_ARCH) $(CROSS_ARCH_ON_$(RUN_OS)_$(RUN_ARCH)),\
            $(OS)/$(ARCH)\
        )\
    )\
)

GOAL_OS := $(RUN_OS) $(CROSS_OS_ON_$(RUN_OS))
KNOW_PLATFORM := $(call AVAILABLE_PLATFORM,$(KNOW_OS))

TAG_PROD := -prod
TAG_DEBUG := -debug
TAG_PKG := -pkg
TARGET_OS_DIRS := $(foreach OS,$(GOAL_OS),$(BIN_DIR)/$(OS)/)
BIN_OS_DIRS := $(foreach OS,$(KNOW_OS),$(BIN_DIR)/$(OS)/)
BIN_PLATFORMS := $(foreach P,$(KNOW_PLATFORM),$(BIN_DIR)/$(P))

WITH_TAG = $(strip $(foreach S,$(1),$(S)$(2)))
WITH_TAG_PROD = $(call WITH_TAG,$(1),$(TAG_PROD))
WITH_TAG_DEBUG = $(call WITH_TAG,$(1),$(TAG_DEBUG))
WITH_TAG_PKG = $(call WITH_TAG,$(1),$(TAG_PKG))

TARGET_OS_DIRS_PROD  := $(call WITH_TAG_PROD,$(TARGET_OS_DIRS))
TARGET_OS_DIRS_DEBUG := $(call WITH_TAG_DEBUG,$(TARGET_OS_DIRS))
TARGET_OS_DIRS_PKG := $(call WITH_TAG_PKG,$(TARGET_OS_DIRS))
BIN_OS_DIRS_PROD  := $(call WITH_TAG_PROD,$(BIN_OS_DIRS))
BIN_OS_DIRS_DEBUG := $(call WITH_TAG_DEBUG,$(BIN_OS_DIRS))
BIN_OS_DIRS_PKG := $(call WITH_TAG_PKG,$(BIN_OS_DIRS))

# ----------------------------------------------------------

# make OS1 OS2
ifneq (,$(word 2,$(filter $(KNOW_OS),$(MAKECMDGOALS))))
  ifeq (,$(SKIP_FRONT))
    $(error Cannot build multiple OS targets as 'make OS1 OS2' without 'SKIP_FRONT=1')
  endif
endif

TARGET_FRONT := $(if $(SKIP_FRONT),,front)
TARGET_FRONT_CLEAN := $(if $(SKIP_FRONT_CLEAN),,front-clean-map)

.PHONY: all
all: $(TARGET_FRONT) \
     $(if $(SKIP_DEBUG),,$(TARGET_OS_DIRS_DEBUG)) \
     $(TARGET_FRONT_CLEAN) \
     $(TARGET_OS_DIRS_PROD) \
     $(if $(SKIP_PKG),,$(TARGET_OS_DIRS_PKG))

# <OS>
$(KNOW_OS): %: $(TARGET_FRONT) \
               $(if $(SKIP_DEBUG),,$(call WITH_TAG_DEBUG,$(BIN_DIR)/%/)) \
               $(TARGET_FRONT_CLEAN) \
               $(call WITH_TAG_PROD,$(BIN_DIR)/%/) \
               $(if $(SKIP_PKG),,$(call WITH_TAG_PKG,$(BIN_DIR)/%/))

# ----------------------------------------------------------

# build/bin/<OS>/-prod
$(BIN_OS_DIRS_PROD): $(BIN_DIR)/%/$(TAG_PROD):
	$(MAKE) DEBUG="" $(BIN_DIR)/$(call AVAILABLE_PLATFORM,$*)

# build/bin/<OS>/-debug
$(BIN_OS_DIRS_DEBUG): $(BIN_DIR)/%/$(TAG_DEBUG):
	$(MAKE) DEBUG=1 $(BIN_DIR)/$(call AVAILABLE_PLATFORM,$*)

# build/bin/<OS>/-pkg
$(BIN_OS_DIRS_PKG): $(BIN_DIR)/%/$(TAG_PKG):
	$(MAKE) $(BIN_DIR)/$(call AVAILABLE_PLATFORM,$*)/$(TAG_PKG)

# -platform <platform>
# -o <filename>
# -s                skip build frontend
# -debug            debug information + devtools in the application window

# build/bin/<OS>/<ARCH>
$(BIN_PLATFORMS): $(BIN_DIR)/%:
	$(WAILS) build $(BUILD_ARGS) \
	  -platform $* \
	  -o $(call INNER_BIN_NAME,$*)
ifeq (,$(SKIP_ZIP))
	zip --junk-paths $(call RESULT_BIN_NAME_ZIP,$*) $(BIN_DIR)/$(call INNER_BIN_NAME,$*)
endif

# ----------------------------------------------------------

# build/bin/<OS>/<ARCH>/-pkg
ifeq (,$(SKIP_PKG_NSIS))
$(BIN_DIR)/windows/%/$(TAG_PKG): win-wv2
	$(NSIS) \
	  -DARG_WAILS_$(ARCH_UC_$*)_BINARY=../../../$(BIN_DIR)/$(call INNER_BIN_NAME,windows/$*) \
	  $(if $(SKIP_DEBUG),,\
	    -DARG_WAILS_$(ARCH_UC_$*)_BINARY_DEBUG=../../../$(BIN_DIR)/$(call INNER_BIN_NAME_3,windows,$*,debug)\
	  ) \
	  -DOUTPUT_FILENAME=../../../$(call RESULT_BIN_NAME_WINDOWS_PKG,$*) \
	  $(if $(VERSION),\
	    -DINFO_PRODUCTVERSION=$(VERSION)\
	  ) \
	  build/windows/installer/sple.nsi
else
$(BIN_DIR)/windows/%/$(TAG_PKG):
	echo NSIS skipped
endif

$(BIN_DIR)/linux/%/$(TAG_PKG):
ifeq (,$(SKIP_PKG_DEB))
	ARCH='$*' \
	  VERSION='$(VERSION)' \
	  BIN_FILE='$(BIN_DIR)/$(call INNER_BIN_NAME,linux/$*)' \
	  $(if $(SKIP_DEBUG),,\
	    BIN_FILE_DEBUG='$(BIN_DIR)/$(call INNER_BIN_NAME_3,linux,$*,debug)'\
	  ) \
	  DEB_TPL_DIR=build/linux/deb \
	  OUT_FILE=$(call RESULT_BIN_NAME_LINUX_DEB,$*) \
	  build/linux/make-deb.sh
else
	echo DEB skipped
endif
# TODO: rpm

$(BIN_DIR)/darwin/%/$(TAG_PKG):
	echo No packaging support

.PHONY: win-wv2
win-wv2: $(WV2_DEST)

$(WV2_DEST): $(WV2_DIR)/
	cp "$(WV2_SRC)" "$@"

$(WV2_DIR)/:
	mkdir -p "$@"

# ----------------------------------------------------------

.PHONY: front
front:
	$(MAKE) -C $(FRONT_DIR) wails

.PHONY: front-clean-map
front-clean-map:
	$(MAKE) -C $(FRONT_DIR) clean-wails-map

.PHONY: clean-bin-os
clean-bin-os:
	$(RM) -r $(BIN_OS_DIRS)

.PHONY: clean
clean:
	$(RM) -r $(BIN_DIR) $(WV2_DIR)
	$(MAKE) -C $(FRONT_DIR) clean

FORCE:
