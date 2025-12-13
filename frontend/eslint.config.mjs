import { defineConfig } from "eslint/config";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import js from "@eslint/js";
import ts from "typescript-eslint";

export default defineConfig([
  {
    ignores: [
      "dist/",
      "dist-wails/",
      "src/backend/wails/go/",
      "src/backend/wails/runtime/",
      "wailsjs/",
      "eslint.config.mjs",
    ],
  },
  {
    plugins: {
      js,
      ts,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },

    extends: [
      js.configs.recommended,
      ts.configs.recommended,
      reactHooks.configs.flat.recommended,
    ],

    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },

    rules: {
      "no-empty": [
        "warn",
        {
          allowEmptyCatch: true,
        },
      ],

      "react-refresh/only-export-components": [
        "warn",
        {
          allowConstantExport: true,
        },
      ],

      "@typescript-eslint/no-explicit-any": ["warn"],
      "@typescript-eslint/no-namespace": ["warn"],
      "@typescript-eslint/no-empty-object-type": ["warn"],

      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          ignoreRestSiblings: true,
        },
      ],
    },
  },
]);
