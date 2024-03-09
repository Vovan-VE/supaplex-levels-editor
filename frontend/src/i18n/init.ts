import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { IS_WAILS } from "configs";
import desktop from "./en/desktop.json";
import main from "./en/main.json";
import web from "./en/web.json";

const en = {
  main,
  ...(IS_WAILS ? { desktop } : { web }),
};

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
