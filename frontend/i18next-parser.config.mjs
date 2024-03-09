// https://github.com/i18next/i18next-parser#options
const config = {
  locales: ["en"],
  defaultNamespace: "main",
  input: [
    "index.html",
    "src/**/*.{ts,tsx}",
    // "!src/i18n/**",
    "!src/**/*.{test.{ts,tsx},d.ts}",
    "!src/**/{__mocks__,*.dev}/**",
  ],
  output: "src/i18n/$LOCALE/$NAMESPACE.json",
  sort: true,
  // verbose: true,
  createOldCatalogs: false,
};
export default config;
