# SpLE

<img src="frontend/public/favicon.svg" alt="sd-ed" align="right" width="96" height="96">

[![Version](https://img.shields.io/github/package-json/v/vovan-ve/supaplex-levels-editor?filename=frontend%2Fpackage.json)](https://github.com/Vovan-VE/supaplex-levels-editor/releases)
[![sple.me](https://img.shields.io/badge/https-sple.me-blue)][sple.me]
[![License](https://img.shields.io/github/license/vovan-ve/supaplex-levels-editor)](./LICENSE)
<br>
[![Development version](https://img.shields.io/github/package-json/v/vovan-ve/supaplex-levels-editor/devel?filename=frontend%2Fpackage.json&label=in+dev)](https://github.com/Vovan-VE/supaplex-levels-editor/blob/devel/CHANGELOG.md)
[![Last commit in devel](https://img.shields.io/github/last-commit/vovan-ve/supaplex-levels-editor/devel)](https://github.com/Vovan-VE/supaplex-levels-editor/compare/devel)

SpLE is **Supaplex Levels Editor**. Inspired by [Supaplex.Online][spo] and its
community.

My previous editor (Winplex Collection Editor — WpColEd) is stuck in far 2010 on
Windows. Its source code was lost somewhere in 2016 or about that with HDD
failure. And so, here it is: yet another Supaplex levels editor!

**SpLE** comes in two forms:

- [sple.me][sple.me] is a web app;
- Desktop version.

> **SpLE** is under development still. Feel free to report bugs, suggest
> enhancements and correct grammar mistakes.
>
> See also [TODO](./TODO.md).

![screenshot](./.github/preview.png)

## [sple.me][sple.me] Important notes

[sple.me][sple.me] is completely frontend (client side) application (web page).
It works only with pseudo-files in browser memory.

- After you opened existing file, it becomes in-memory copy of the original
  file. Technically you are uploading your local file to a web page.
- In-memory files you opened or created from scratch are NOT related to regular
  files out of browser.
- To get your modified file back as regular file technically you need to
  download file from web page (with appropriate UI button in
  [sple.me][sple.me]).

Also:

- [sple.me][sple.me] application uses `indexedDB` and `localStorage` for better
  user experience. These things are similar to well known _Cookies_ in terms of
  privacy.

  [sple.me][sple.me] will try to remember your modified in-memory files and some
  preferences in browser storage for better user experience.

- There are no intention to send any kind of your data to somewhere without your
  confirmation.

  [sple.me][sple.me] when completely loaded is operating locally in your
  browser. Neither external storages, nor cross-device sync are implied, nor
  planned.

  [sple.me][sple.me] uses [Supaplex.Online test page][spo.test] to test your
  level when you request that.

- DON'T rely much on browser storage to remember your modified in-memory files
  forever. DO SAVE BACKUPS. Browser can clean its storage.

  Also, [sple.me][sple.me] storage in browser can be accidentally reset in case
  of some errors in **SpLE** itself. Because, you know: _Every program has at
  least one bug_.

## Desktop SpLE

Desktop version of **SpLE** built using [Wails][wails]. It uses the same source
code as web app [sple.me][sple.me] to render frontend, but with some different
backend bindings to work with its host binary in desktop environment.

**Desktop SpLE** compared to [sple.me][sple.me] _DOES_ work with regular files
on your device, like other whatever desktop editors do.

### Supported platforms

- Windows 10/11 AMD64: requires [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/);
- Linux AMD64: requires `libwebkit`.

## Contribution, Development

Project root directory was bootstrapped with [Wails][wails].

Frontend common app is now located in `./frontend/` subdirectory. It was
bootstrapped with [Create React App][cra]. Web [sple.me][sple.me] built from
that.

- To run SpLE in live development mode:
  - Desktop: run `wails dev` in the project directory.
  - Web: run `npm start` in `./frontend` subdirectory.
- To build Desktop SpLE run `make` in the project directory with one of
  following targets:
  - `make` or `make all`: This will build all possible binaries under you OS.
  - `make linux`, `make windows` or `make darwin`: This will try to build
    binaries for the given OS. Not every cross-OS build is possible.
    - When building NSIS for Windows with "dev" app version, a `VERSION` must be
      added with simple `X.Y.Z` version, or NSIS will fail otherwise:
      `make VERSION=0.1.2 windows`

  That will build binaries and packages in `./build/bin/` directory. Notice the
  following variables in root `Makefile`:
  - `SKIP_FRONT` if `./frontend/build-wails` was pre-built;
  - `SKIP_DEBUG` to skip debug binaries;
  - `SKIP_ZIP` to skip making zip;
  - `SKIP_PKG` to skip making packages/installers;
  - `SKIP_PKG_NSIS` to skip windows NSIS installer;
  - `SKIP_PKG_DEB` to skip Debian DEB package.

  For example `make SKIP_DEBUG=1 SKIP_ZIP=1 SKIP_PKG=1`.

  Don't use `DEBUG` variable, since it's internal.
- To build web SpLE run `make -C frontend` in project root (or `make` in
  `./frontend` subdirectory which is the same). This will build static web in
  `./frontend/build` directory.

See also [frontend/README.md](./frontend/README.md).

### Requirements

- Common:
  - Node JS >= 18
  - NPM >= 9
- Desktop:
  - Go >= 1.20
  - Wails v2 ([Installation](https://wails.io/docs/gettingstarted/installation))

[cra]: https://github.com/facebook/create-react-app
[sple.me]: https://sple.me
[spo]: https://www.supaplex.online/
[spo.test]: https://www.supaplex.online/test/
[wails]: https://wails.io
