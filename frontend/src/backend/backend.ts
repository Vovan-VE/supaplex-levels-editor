import { Event, Store } from "effector";
import * as I from "./internal";

export type Init = () => void;

export type ConfigStorage = I.ConfigStorage | Promise<I.ConfigStorage>;

export type InstanceIsReadOnly = Store<boolean>;
export type DisplayReadOnly = Store<boolean>;

export type FilesStorage = I.FilesStorage | Promise<I.FilesStorage>;
export type AllowManualSave = boolean;
export type CreateFile = (
  key: I.FilesStorageKey,
  baseName: string,
) => Promise<string>;
export type OpenFile = (options: I.OpenFileOptions) => void;
export type OnOpenFile = Event<I.OpenFiles>;
export type SaveFileAs = (data: Blob, filename: string) => void;

export type SetTitle = (title: string) => void;
export type SetIsDirty = (isDirty: boolean) => Promise<unknown>;
export type OnExitDirty = Event<any>;
export type OnDeactivate = Event<any>;
export type ExitApp = (ignoreDirty?: boolean) => void;

export type TestInIframe = boolean;

export type OnUpgradeAvailable = Event<string>;
