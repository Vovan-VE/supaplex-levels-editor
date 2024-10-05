export { init } from "./init";

export { configStorage } from "./configStorage";

export { $instanceIsReadOnly, $displayReadOnly } from "./instanceSemaphore";

export { filesStorage } from "./filesStorage";
export const allowManualSave = false;
export const createFile = undefined;
export { openFile } from "./openFile";
export { onOpenFile } from "./dnd";
export { saveAs as saveFileAs } from "file-saver";
export { getClipboardText, setClipboardText } from "./clipboard";

export { setTitle } from "./setTitle";
export const setIsDirty = undefined;
export const onExitDirty = undefined;
export { onDeactivate } from "./onDeactivate";
export const exitApp = undefined;

export const testInIframe = false;

export const VersionTag = undefined;
export { InfoDetails } from "./InfoDetails";

export const onUpgradeAvailable = undefined;

export { default as Classes } from "./Backend.module.scss";
