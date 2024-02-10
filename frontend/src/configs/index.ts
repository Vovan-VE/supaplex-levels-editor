//export const APP_NAME = process.env.REACT_APP_NAME || "supaplex-levels-editor";
export const APP_VERSION = process.env.REACT_APP_VERSION;
export const REPO_URL = process.env.REACT_APP_REPO_URL;
export const BUGS_URL = process.env.REACT_APP_BUGS_URL;
export const VERSION_URL = process.env.REACT_APP_VERSION_URL;
export const TEST_LEVEL_TITLE =
  process.env.REACT_APP_TEST_LEVEL_TITLE || "Supaplex.Online";
export const TEST_LEVEL_URL =
  process.env.REACT_APP_TEST_LEVEL_URL || "https://www.supaplex.online/test/";
export const TEST_DEMO_URL =
  process.env.REACT_APP_TEST_DEMO_URL ||
  "https://www.supaplex.online/test/?demo";

export const APP_TITLE = "SpLE";
export const IS_WAILS = (process.env.REACT_APP_WAILS || "") !== "";
export const TEST_MESSAGE_ORIGIN = new URL(TEST_LEVEL_URL).origin;
