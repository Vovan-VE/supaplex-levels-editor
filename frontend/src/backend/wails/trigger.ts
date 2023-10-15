import { createEvent } from "effector";
import { OpenFiles } from "../internal";
import { fileRefToOpenFile } from "./fileRefToOpenFile";
import { files } from "./go/models";

export const onExitDirty = createEvent<any>();
export const onShowError = createEvent<string>();
export const onUpgradeAvailable = createEvent<string>();

const onOpenFileRefs = createEvent<readonly files.WebFileRef[]>();
export const onOpenFile = onOpenFileRefs.map<OpenFiles>((files) =>
  files.map(fileRefToOpenFile),
);

const enum FrontEventType {
  ExitDirty = "exitDirty",
  OpenFiles = "openFiles",
  ShowError = "showError",
  UpgradeAvailable = "upgradeAvailable",
}

export const frontEventsHandlers: Record<string, (data?: any) => void> = {
  [FrontEventType.ExitDirty]: onExitDirty,
  [FrontEventType.OpenFiles]: onOpenFileRefs,
  [FrontEventType.ShowError]: onShowError,
  [FrontEventType.UpgradeAvailable]: onUpgradeAvailable,
};
