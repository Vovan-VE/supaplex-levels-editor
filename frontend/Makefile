NPM ?= npm

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
	find ./build-wails/static -type f -name "*.map" -delete

.PHONY: clean
clean:
	rm -rf ./build
	rm -rf ./build-wails

FORCE:
