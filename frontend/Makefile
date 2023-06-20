NPM ?= npm

BUILD_WEB=./build
BUILD_WAILS=./build-wails

.PHONY: all
all: web

.PHONY: web
web:
	$(NPM) run build
	scripts/fix-build.sh $(BUILD_WEB)

.PHONY: wails-prod
wails-prod: wails clean-wails-map

.PHONY: wails
wails:
	$(NPM) run build:wails
	scripts/fix-build.sh $(BUILD_WAILS)

.PHONY: test
test:
	$(NPM) test

.PHONY: clean-wails-map
clean-wails-map:
	find $(BUILD_WAILS)/static -type f -name "*.map" -delete

.PHONY: clean
clean:
	rm -rf $(BUILD_WEB)
	rm -rf $(BUILD_WAILS)

FORCE:
