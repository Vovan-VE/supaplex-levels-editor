# SpLE frontend common app

Frontend migrated from CRA to [Vite][vite] and [Vitest][vitest] since v0.20.0.
See [previous version](https://github.com/Vovan-VE/supaplex-levels-editor/tree/v0.19.0/frontend).

Ensure to install `husky` git hooks after cloning repository (should be done by
default on `npm ci`).

```sh
npm ci

# start development server
npm start

# run tests in watch mode
npm run test:watch

# build static
make web
```

**On Windows** use PowerShell as [`script-shell`](https://docs.npmjs.com/cli/v10/using-npm/config#script-shell).

[vite]: https://vitejs.dev/
[vitest]: https://vitest.dev/
