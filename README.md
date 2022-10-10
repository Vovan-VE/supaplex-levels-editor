# sp-ed

<img src="public/favicon.svg" alt="sd-ed" align="right" width="96" height="96">

Supaplex levels editor in browser. Inspired by [Supaplex.Online][spo] and its
community.

My previous editor (Winplex Collection Editor) is stuck in far 2010 on Windows.
Its source code was lost somewhere in 2016 or about with HDD failure. And so,
here it is: yet another Supaplex levels editor!

> **sp-ed** is under development still. Feel free to report bugs, suggest
> enhancements and correct grammar mistakes.

## Important to know

**sp-ed** is completely frontend (client side) application (web page). It works
only with pseudo-files in browser memory.

- After you opened existing file (technically you are uploading your local file
  to a web page), it becomes in-memory copy or the original file.
- In-memory files you opened or created from scratch are NOT related to regular
  files out of browser.
- To get your modified file back in form of regular file technically you need to
  download file from web page (with appropriate UI button in **sp-ed**).

Also:

- This application uses `indexedDB` and `localStorage` (which both are similar
  to well known _Cookies_ in terms of privacy) for better user experience.

  **sp-ed** will try to remember your modified in-memory files and some
  preferences in browser storage for better user experience.

- There are no intention to send any kind of your data to somewhere.

  **sp-ed** when completely loaded is operating locally in your browser. Neither
  external storages, nor cross-device sync are implied, nor planned.

- DON'T rely much on browser storage to remember your modified in-memory files
  forever. DO SAVE BACKUPS. Browser can clean its storage.

## Planned features (unsorted)

- Configuration dialog before creating new file.
- More editing tools at least those from Winplex Collection Editor.
- Better adaptive UI for mobile device and/or small screen.
- End User Manual.
- Draggable files buttons to reorder many opened files.
- Electron based desktop application.

## Known Issues

- Mobile device can't fit all UI.
- Large MPX levels are laggy.
- Some preferences may be lost in development environment.

## Contribution, Development

This project was bootstrapped with [Create React App][cra].

Ensure to install `husky` git hooks after cloning repository with (should be
done by default on `npm ci`).

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
[spo]: https://www.supaplex.online/
