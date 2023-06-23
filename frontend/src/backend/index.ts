import * as B from "./backend";
import * as wails from "./wails";
import * as web from "./web";

export type {
  OpenFileDoneItem,
  FilesStorageKey,
  FilesStorageItem,
} from "./internal";

const WAILS = Boolean(process.env.REACT_APP_WAILS);

export const init: B.Init = WAILS ? wails.init : web.init;

export const configStorage: B.ConfigStorage = WAILS
  ? wails.configStorage
  : web.configStorage;

export const $instanceIsReadOnly: B.InstanceIsReadOnly | undefined = WAILS
  ? wails.$instanceIsReadOnly
  : web.$instanceIsReadOnly;

export const $displayReadOnly: B.DisplayReadOnly | undefined = WAILS
  ? wails.$displayReadOnly
  : web.$displayReadOnly;

export const filesStorage: B.FilesStorage = WAILS
  ? wails.filesStorage
  : web.filesStorage;
export const allowManualSave: B.AllowManualSave = WAILS
  ? wails.allowManualSave
  : web.allowManualSave;
export const createFile: B.CreateFile | undefined = WAILS
  ? wails.createFile
  : web.createFile;
export const openFile: B.OpenFile = WAILS ? wails.openFile : web.openFile;
export const saveFileAs: B.SaveFileAs = WAILS
  ? wails.saveFileAs
  : web.saveFileAs;

export const setTitle: B.SetTitle = WAILS ? wails.setTitle : web.setTitle;
export const setIsDirty: B.SetIsDirty | undefined = WAILS
  ? wails.setIsDirty
  : web.setIsDirty;
export const onExitDirty: B.OnExitDirty | undefined = WAILS
  ? wails.onExitDirty
  : web.onExitDirty;
export const onDeactivate: B.OnDeactivate | undefined = WAILS
  ? undefined
  : web.onDeactivate;
export const exitApp: B.ExitApp | undefined = WAILS
  ? wails.exitApp
  : web.exitApp;

export const testInIframe: B.TestInIframe = WAILS
  ? wails.testInIframe
  : web.testInIframe;

export const VersionTag = WAILS ? wails.VersionTag : web.VersionTag;
export const InfoDetails = WAILS ? wails.InfoDetails : web.InfoDetails;

export const onUpgradeAvailable: B.OnUpgradeAvailable | undefined = WAILS
  ? wails.onUpgradeAvailable
  : web.onUpgradeAvailable;
