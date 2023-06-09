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

.PHONY: dev
dev:
	$(NPM) start

.PHONY: test
test:
	$(NPM) test

.PHONY: clean-wails-map
clean-wails-map:
	find ./build-wails/static -type f -name "*.map" -delete

.PHONY: clean
clean:
	rm -r ./build
	rm -r ./build-wails

FORCE:
