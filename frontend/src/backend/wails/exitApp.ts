import { Application } from "@wailsio/runtime";
import { SetIsDirty } from "./bindings/github.com/vovan-ve/sple-desktop/app";

export const exitApp = (ignoreDirty?: boolean) => {
  if (ignoreDirty) {
    SetIsDirty(false).then(() => Application.Quit());
  } else {
    Application.Quit();
  }
};
