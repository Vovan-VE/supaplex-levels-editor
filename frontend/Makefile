NODE ?= node
NPM ?= npm

BUILD_WEB = ./dist
BUILD_WAILS = ./dist-wails

.PHONY: all
all: web

.PHONY: web
web:
	$(NPM) run build

.PHONY: wails-prod
wails-prod: wails clean-wails-map

.PHONY: wails
wails:
	$(NPM) run build:wails

.PHONY: test
test:
	$(NPM) test

.PHONY: clean-wails-map
clean-wails-map:
	find $(BUILD_WAILS)/assets -type f -name "*.map" -delete

.PHONY: get-version
get-version:
	$(NODE) -e "console.log(require('./package.json').version)"

.PHONY: clean
clean:
	$(RM) -r $(BUILD_WEB) $(BUILD_WAILS)

FORCE:
