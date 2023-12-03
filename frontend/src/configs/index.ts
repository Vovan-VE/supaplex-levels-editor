const {
  // REACT_APP_NAME: APP_NAME = "supaplex-levels-editor",
  REACT_APP_VERSION: APP_VERSION,
  REACT_APP_REPO_URL: REPO_URL,
  REACT_APP_BUGS_URL: BUGS_URL,
  REACT_APP_VERSION_URL: VERSION_URL,
  REACT_APP_TEST_LEVEL_TITLE: TEST_LEVEL_TITLE = "Supaplex.Online",
  REACT_APP_TEST_LEVEL_URL:
    TEST_LEVEL_URL = "https://www.supaplex.online/test/",
  REACT_APP_TEST_DEMO_URL:
    TEST_DEMO_URL = "https://www.supaplex.online/test/?demo",
} = process.env;

export {
  // APP_NAME,
  APP_VERSION,
  REPO_URL,
  BUGS_URL,
  VERSION_URL,
  TEST_LEVEL_TITLE,
  TEST_LEVEL_URL,
  TEST_DEMO_URL,
};

export const APP_TITLE = "SpLE";
export const IS_WAILS = (process.env.REACT_APP_WAILS || "") !== "";
export const TEST_MESSAGE_ORIGIN = new URL(TEST_LEVEL_URL).origin;
