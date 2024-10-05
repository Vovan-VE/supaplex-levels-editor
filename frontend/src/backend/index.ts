import { IS_WAILS } from "configs";
import * as B from "./backend";
import * as wails from "./wails";
import * as web from "./web";

export type {
  OpenFileItem,
  FilesStorageKey,
  FilesStorageItem,
} from "./internal";

export const init: B.Init = IS_WAILS ? wails.init : web.init;

export const configStorage: B.ConfigStorage = IS_WAILS
  ? wails.configStorage
  : web.configStorage;

export const $instanceIsReadOnly: B.InstanceIsReadOnly | undefined = IS_WAILS
  ? wails.$instanceIsReadOnly
  : web.$instanceIsReadOnly;

export const $displayReadOnly: B.DisplayReadOnly | undefined = IS_WAILS
  ? wails.$displayReadOnly
  : web.$displayReadOnly;

export const filesStorage: B.FilesStorage = IS_WAILS
  ? wails.filesStorage
  : web.filesStorage;
export const allowManualSave: B.AllowManualSave = IS_WAILS
  ? wails.allowManualSave
  : web.allowManualSave;
export const createFile: B.CreateFile | undefined = IS_WAILS
  ? wails.createFile
  : web.createFile;
export const openFile: B.OpenFile = IS_WAILS ? wails.openFile : web.openFile;
export const onOpenFile: B.OnOpenFile = IS_WAILS
  ? wails.onOpenFile
  : web.onOpenFile;
// export const onOpenFile: B.OnOpenFile | undefined = IS_WAILS
//   ? wails.onOpenFile
//   : undefined;
export const saveFileAs: B.SaveFileAs = IS_WAILS
  ? wails.saveFileAs
  : web.saveFileAs;
export const getClipboardText: B.GetClipboardText = IS_WAILS
  ? wails.getClipboardText
  : web.getClipboardText;
export const setClipboardText: B.SetClipboardText = IS_WAILS
  ? wails.setClipboardText
  : web.setClipboardText;

export const setTitle: B.SetTitle = IS_WAILS ? wails.setTitle : web.setTitle;
export const setIsDirty: B.SetIsDirty | undefined = IS_WAILS
  ? wails.setIsDirty
  : web.setIsDirty;
export const onExitDirty: B.OnExitDirty | undefined = IS_WAILS
  ? wails.onExitDirty
  : web.onExitDirty;
export const onDeactivate: B.OnDeactivate | undefined = IS_WAILS
  ? undefined
  : web.onDeactivate;
export const exitApp: B.ExitApp | undefined = IS_WAILS
  ? wails.exitApp
  : web.exitApp;

export const testInIframe: B.TestInIframe = IS_WAILS
  ? wails.testInIframe
  : web.testInIframe;

export const VersionTag = IS_WAILS ? wails.VersionTag : web.VersionTag;
export const InfoDetails = IS_WAILS ? wails.InfoDetails : web.InfoDetails;

export const onUpgradeAvailable: B.OnUpgradeAvailable | undefined = IS_WAILS
  ? wails.onUpgradeAvailable
  : web.onUpgradeAvailable;

export const Classes = IS_WAILS ? wails.Classes : web.Classes;
