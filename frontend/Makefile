NPM ?= npm

BUILD_WEB = ./build
BUILD_WAILS = ./build-wails

SCRIPT_FIX_BUILD = ./scripts/fix-build.sh

.PHONY: all
all: web

.PHONY: web
web:
	$(NPM) run build
	$(SCRIPT_FIX_BUILD) $(BUILD_WEB)

.PHONY: wails-prod
wails-prod: wails clean-map

.PHONY: wails
wails:
	$(NPM) run build:wails
	$(SCRIPT_FIX_BUILD) $(BUILD_WAILS)

.PHONY: test
test:
	$(NPM) test

.PHONY: clean-map
clean-map:
	find $(BUILD_WAILS)/static -type f -name "*.map" -delete

.PHONY: clean
clean:
	rm -rf $(BUILD_WEB)
	rm -rf $(BUILD_WAILS)

FORCE:
