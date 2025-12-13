import { IS_WAILS as D } from "configs";
import * as EN from "./en";
import * as RU from "./ru";

const d = "desktop";
const w = "web";

const en = { main: EN.main, ...(D ? { [d]: EN.desktop } : { [w]: EN.web }) };
const ru = { main: RU.main, ...(D ? { [d]: RU.desktop } : { [w]: RU.web }) };

export const locales = {
  en,
  ru,
};
type LocaleName = keyof typeof locales;

const hasOwn = Object.hasOwn;
export const isValidLocale = (s: unknown): s is LocaleName =>
  typeof s === "string" && hasOwn(locales, s);

const defaultLang: keyof typeof locales = "en";
export default defaultLang;
