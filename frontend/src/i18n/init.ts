import i18n from "i18next";
import { ResourceLanguage } from "i18next/typescript/options";
import { initReactI18next } from "react-i18next";
import { IS_WAILS } from "configs";
import desktop from "./en/desktop.json";
import main from "./en/main.json";
import web from "./en/web.json";

// FIXME: unused json are still presented in build as `JSON.parse('...')` in void context

const envNS: ResourceLanguage = IS_WAILS ? { desktop } : { web };

i18n.use(initReactI18next).init({
  lng: "en",
  resources: {
    en: {
      main,
      ...envNS,
    },
  },
  ns: ["main", ...Object.keys(envNS)],
  defaultNS: "main",
  interpolation: {
    prefix: "{", // TODO: ICU?
    suffix: "}", // TODO: ICU?
    escapeValue: false,
  },
  returnEmptyString: false,
  appendNamespaceToMissingKey: false,
});
