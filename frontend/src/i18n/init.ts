import i18n from "i18next";
import { ResourceLanguage } from "i18next/typescript/options";
import { initReactI18next } from "react-i18next";
import { desktop, main, web } from "./en";

const WAILS = Boolean(process.env.REACT_APP_WAILS);
const envNS: ResourceLanguage = WAILS ? { desktop } : { web };

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
