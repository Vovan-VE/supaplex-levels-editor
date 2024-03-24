import fs from "fs";
import path from "path";

// src/i18n
const languagesDir = path.join(import.meta.dirname, "src", "i18n");
const reLangDir = /^[a-z]{2}(-[A-Z]{2})?$/;

const locales = fs
  .readdirSync(languagesDir, { withFileTypes: true })
  .reduce(
    /**
     * @param {string[]} list
     * @param {Dirent} d
     * @return {string[]}
     */
    (list, d) => {
      if (d.isDirectory()) {
        const m = d.name.match(reLangDir);
        if (m) {
          list.push(m[0]);
        }
      }
      return list;
    },
    /** @type {string[]} */
    [],
  )
  .sort();

// https://github.com/i18next/i18next-parser#options
const config = {
  locales,
  defaultNamespace: "main",
  input: [
    "index.html",
    "src/**/*.{ts,tsx}",
    "!src/i18n/*/**",
    "!src/**/*.{test.{ts,tsx},d.ts}",
    "!src/**/{__mocks__,*.dev}/**",
  ],
  output: "src/i18n/$LOCALE/$NAMESPACE.json",
  sort: true,
  // verbose: true,
  createOldCatalogs: false,
};
export default config;
