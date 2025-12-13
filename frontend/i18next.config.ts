import * as fs from "fs";
import * as path from "path";
import { defineConfig } from "i18next-cli";

// src/i18n
const languagesDir = path.join(__dirname, "src", "i18n");
const reLangDir = /^[a-z]{2}(-[A-Z]{2})?$/;

const locales = fs
  .readdirSync(languagesDir, { withFileTypes: true })
  .reduce<string[]>((list, d) => {
    if (d.isDirectory()) {
      const m = d.name.match(reLangDir);
      if (m) {
        list.push(m[0]);
      }
    }
    return list;
  }, [])
  .sort();

// https://github.com/i18next/i18next-cli#advanced-configuration
export default defineConfig({
  locales,
  extract: {
    input: [
      //"index.html",
      "src/**/*.{ts,tsx}",
      "!src/i18n/*/**",
      "!src/**/*.{test.{ts,tsx},d.ts}",
      "!src/**/{__mocks__,*.dev}/**",
    ],
    output: "src/i18n/{{language}}/{{namespace}}.json",
    defaultNS: "main",
    defaultValue: "",
    sort: true,
  },
});
