export { init } from "./init";

export { configStorage } from "./configStorage";

export const $instanceIsReadOnly = undefined;
export const $displayReadOnly = undefined;

export { filesStorage } from "./filesStorage";
export const allowManualSave = true;
export { CreateFile as createFile } from "./go/main/App";
export { openFile } from "./openFile";
export { onOpenFile } from "./trigger";
export { saveFileAs } from "./saveFileAs";

export { WindowSetTitle as setTitle } from "./runtime";
export { SetIsDirty as setIsDirty } from "./go/main/App";
export { onExitDirty } from "./trigger";
export { exitApp } from "./exitApp";

export const testInIframe = true;

export { VersionTag } from "./VersionTag";
export { InfoDetails } from "./InfoDetails";

export { onUpgradeAvailable } from "./trigger";
