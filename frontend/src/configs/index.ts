//export const APP_NAME = import.meta.env.VITE_NAME || "supaplex-levels-editor";
export const APP_VERSION = import.meta.env.VITE_VERSION;
export const REPO_URL = import.meta.env.VITE_REPO_URL;
export const BUGS_URL = import.meta.env.VITE_BUGS_URL;
export const VERSION_URL = import.meta.env.VITE_VERSION_URL;
export const TEST_LEVEL_TITLE =
  import.meta.env.VITE_TEST_LEVEL_TITLE || "Supaplex.Online";
export const TEST_LEVEL_URL =
  import.meta.env.VITE_TEST_LEVEL_URL || "https://www.supaplex.online/test/";
export const TEST_DEMO_URL =
  import.meta.env.VITE_TEST_DEMO_URL ||
  "https://www.supaplex.online/test/?demo";

export const APP_TITLE = "SpLE";
export const IS_WAILS = (import.meta.env.VITE_WAILS || "") !== "";
export const TEST_MESSAGE_ORIGIN = new URL(TEST_LEVEL_URL).origin;
