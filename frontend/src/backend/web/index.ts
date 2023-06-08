export { init } from "./init";

export { configStorage } from "./configStorage";

export { $instanceIsReadOnly, $displayReadOnly } from "./instanceSemaphore";

export { filesStorage } from "./filesStorage";
export const allowManualSave = false;
export const createFile = undefined;
export { openFile } from "./openFile";
export { saveAs as saveFileAs } from "file-saver";

export { setTitle } from "./setTitle";
export const setIsDirty = undefined;
export const onExitDirty = undefined;
export { onDeactivate } from "./onDeactivate";
export const exitApp = undefined;

export const testInIframe = true;
