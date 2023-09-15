NODE ?= node
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
wails-prod: wails clean-wails-map

.PHONY: wails
wails:
	$(NPM) run build:wails
	$(SCRIPT_FIX_BUILD) $(BUILD_WAILS)

.PHONY: test
test:
	$(NPM) test

.PHONY: clean-wails-map
clean-wails-map:
	find $(BUILD_WAILS)/static -type f -name "*.map" -delete

.PHONY: get-version
get-version:
	$(NODE) -e "console.log(require('./package.json').version)"

.PHONY: clean
clean:
	$(RM) -r $(BUILD_WEB) $(BUILD_WAILS)

FORCE:
