//export const APP_NAME = import.meta.env.VITE_NAME || "supaplex-levels-editor";
export const APP_VERSION: string = import.meta.env.VITE_VERSION;
export const REPO_URL: string = import.meta.env.VITE_REPO_URL;
export const BUGS_URL: string = import.meta.env.VITE_BUGS_URL;
export const VERSION_URL: string = import.meta.env.VITE_VERSION_URL;
export const TEST_LEVEL_TITLE: string =
  import.meta.env.VITE_TEST_LEVEL_TITLE || "Megaplex.Online";
export const TEST_LEVEL_URL: string =
  import.meta.env.VITE_TEST_LEVEL_URL || "https://www.megaplex.website/test/";
export const TEST_DEMO_URL: string =
  import.meta.env.VITE_TEST_DEMO_URL ||
  "https://www.megaplex.website/test/?demo";

export const APP_TITLE = "SpLE";
export const IS_WAILS = (import.meta.env.VITE_WAILS || "") !== "";
export const TEST_MESSAGE_ORIGIN = new URL(TEST_LEVEL_URL).origin;
