export { init } from "./init";

export { configStorage } from "./configStorage";

export { $instanceIsReadOnly, $displayReadOnly } from "./instanceSemaphore";

export { filesStorage } from "./filesStorage";
export { flushEvents } from "../common";
export const allowManualSave = false;
export { openFile } from "./openFile";
export { saveAs as saveFileAs } from "file-saver";

export const setIsDirty = undefined;
export const onExitDirty = undefined;
export { onDeactivate } from "./onDeactivate";
export const exitApp = undefined;

export const testInIframe = false;
