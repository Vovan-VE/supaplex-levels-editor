import { Event, Store } from "effector";
import * as I from "./internal";

export type Init = () => void;

export type ConfigStorage = I.ConfigStorage | Promise<I.ConfigStorage>;

export type InstanceIsReadOnly = Store<boolean>;
export type DisplayReadOnly = Store<boolean>;

export type FilesStorage = I.FilesStorage | Promise<I.FilesStorage>;
export type FlushEvents = I.FlushEvents;
export type AllowManualSave = boolean;
export type OpenFile = (options: I.OpenFileOptions) => void;
export type SaveFileAs = (data: Blob | string, filename: string) => void;

export type SetIsDirty = (isDirty: boolean) => Promise<unknown>;
export type OnExitDirty = Event<any>;
export type OnDeactivate = Event<any>;
export type ExitApp = () => void;

export type TestInIframe = boolean;
