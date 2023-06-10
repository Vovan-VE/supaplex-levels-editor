import { SetIsDirty } from "./go/main/App";
import { Quit } from "./runtime";

export const exitApp = (ignoreDirty?: boolean) => {
  if (ignoreDirty) {
    SetIsDirty(false).then(() => Quit());
  } else {
    Quit();
  }
};
