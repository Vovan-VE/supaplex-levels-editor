# SpLE

<img src="public/favicon.svg" alt="sd-ed" align="right" width="96" height="96">

[![Version](https://img.shields.io/github/package-json/v/vovan-ve/supaplex-levels-editor)](https://github.com/Vovan-VE/supaplex-levels-editor/releases)
[![sple.me](https://img.shields.io/badge/https-sple.me-blue)][sple.me]
[![License](https://img.shields.io/github/license/vovan-ve/supaplex-levels-editor)](./LICENSE)
<br>
[![Development version](https://img.shields.io/github/package-json/v/vovan-ve/supaplex-levels-editor/devel?label=in+dev)](https://github.com/Vovan-VE/supaplex-levels-editor/blob/devel/CHANGELOG.md)
[![Last commit in devel](https://img.shields.io/github/last-commit/vovan-ve/supaplex-levels-editor/devel)](https://github.com/Vovan-VE/supaplex-levels-editor/compare/devel)

[sple.me][sple.me] is **Supaplex Levels Editor** in browser. Inspired by
[Supaplex.Online][spo] and its community.

My previous editor (Winplex Collection Editor — WpColEd) is stuck in far 2010 on
Windows. Its source code was lost somewhere in 2016 or about that with HDD
failure. And so, here it is: yet another Supaplex levels editor!

> **SpLE** is under development still. Feel free to report bugs, suggest
> enhancements and correct grammar mistakes.

## Important to know

**SpLE** is completely frontend (client side) application (web page). It works
only with pseudo-files in browser memory.

- After you opened existing file, it becomes in-memory copy of the original
  file. Technically you are uploading your local file to a web page.
- In-memory files you opened or created from scratch are NOT related to regular
  files out of browser.
- To get your modified file back as regular file technically you need to
  download file from web page (with appropriate UI button in **SpLE**).

Also:

- This application uses `indexedDB` and `localStorage` for better user
  experience. These things are similar to well known _Cookies_ in terms of
  privacy.

  **SpLE** will try to remember your modified in-memory files and some
  preferences in browser storage for better user experience.

- There are no intention to send any kind of your data to somewhere without your
  confirmation.

  **SpLE** when completely loaded is operating locally in your browser. Neither
  external storages, nor cross-device sync are implied, nor planned.

  **SpLE** uses [Supaplex.Online test page][spo.test] to test your level when
  you request that.

- DON'T rely much on browser storage to remember your modified in-memory files
  forever. DO SAVE BACKUPS. Browser can clean its storage.

  Also, **SpLE**-related storage in browser can be accidentally reset in case of
  some errors in **SpLE** itself. Because, you know: _Every program has at least
  one bug_.

## Planned features (unsorted)

- More features from Winplex Collection Editor.
- Compare levels.
- End User Manual.
- Draggable files buttons to reorder many opened files.
- Wails based desktop application.
- See more in [TODO](./TODO.md).

## Contribution, Development

This project was bootstrapped with [Create React App][cra].

Ensure to install `husky` git hooks after cloning repository (should be done by
default on `npm ci`).

```sh
git clone ...
cd ...
npm ci

# start development server
npm start

# run tests in watch mode
npm run test:watch
```

[cra]: https://github.com/facebook/create-react-app
[sple.me]: https://sple.me
[spo]: https://www.supaplex.online/
[spo.test]: https://www.supaplex.online/test/
