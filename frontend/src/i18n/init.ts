import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import defaultLang, { locales } from "./locales";

i18n.use(initReactI18next).init({
  lng: defaultLang,
  supportedLngs: Object.keys(locales),
  fallbackLng: defaultLang,
  resources: locales,
  ns: Object.keys(locales[defaultLang]),
  defaultNS: "main",
  interpolation: {
    prefix: "{", // TODO: ICU?
    suffix: "}", // TODO: ICU?
    escapeValue: false,
  },
  returnEmptyString: false,
  appendNamespaceToMissingKey: false,
});

i18n.on("languageChanged", (lng) => {
  document.documentElement.setAttribute("lang", lng);
});
