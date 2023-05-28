import * as B from "./backend";
import * as web from "./web";

// const WAILS = Boolean(process.env.REACT_APP_WAILS);

export const init: B.Init = web.init;

export const configStorage: B.ConfigStorage = web.configStorage;

export const $instanceIsReadOnly: B.InstanceIsReadOnly =
  web.$instanceIsReadOnly;
export const $displayReadOnly: B.DisplayReadOnly = web.$displayReadOnly;

export const filesStorage: B.FilesStorage = web.filesStorage;
export const flushEvents: B.FlushEvents = web.flushEvents;
export const allowManualSave: B.AllowManualSave = web.allowManualSave;
export const openFile: B.OpenFile = web.openFile;
export const saveFileAs: B.SaveFileAs = web.saveFileAs;

export const setIsDirty: B.SetIsDirty | undefined = web.setIsDirty;
export const onExitDirty: B.OnExitDirty | undefined = web.onExitDirty;
export const onDeactivate: B.OnDeactivate = web.onDeactivate;
export const exitApp: B.ExitApp | undefined = web.exitApp;

export const testInIframe: B.TestInIframe = web.testInIframe;
