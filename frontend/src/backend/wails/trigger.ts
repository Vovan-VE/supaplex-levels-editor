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

export const frontEventsHandlers: Record<string, (data?: any) => void> = {
  exitDirty: onExitDirty,
  openFiles: onOpenFileRefs,
  showError: onShowError,
  upgradeAvailable: onUpgradeAvailable,
};
