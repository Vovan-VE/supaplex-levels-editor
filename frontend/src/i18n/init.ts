import i18n from "i18next";
import { Resource } from "i18next/typescript/options";
import { initReactI18next } from "react-i18next";
import { IS_WAILS } from "configs";
import desktop from "./en/desktop.json";
import main from "./en/main.json";
import web from "./en/web.json";

// TODO: A JSON from regular imported when is unused after optimization, is
//  still presented in build as unused `JSON.parse('...')` in void context.
//
// When conditional JSONs are dynamic imports, both are still presented in build
// as separate chunk, while only one is actually used.
//
// So, now in current env there is no way to optimize unused JSON.

const en: Resource = {
  main,
};
if (IS_WAILS) {
  // import(/* webpackPrefetch: true */ "./en/desktop.json").then((v) => {
  //   en.desktop = v;
  // });
  en.desktop = desktop;
} else {
  // import(/* webpackPrefetch: true */ "./en/web.json").then((v) => {
  //   en.web = v;
  // });
  en.web = web;
}

i18n.use(initReactI18next).init({
  lng: "en",
  resources: {
    en,
  },
  ns: Object.keys(en),
  defaultNS: "main",
  interpolation: {
    prefix: "{", // TODO: ICU?
    suffix: "}", // TODO: ICU?
    escapeValue: false,
  },
  returnEmptyString: false,
  appendNamespaceToMissingKey: false,
});
