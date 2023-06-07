import type { StoreDriver, StoreDriverSingle } from "@cubux/storage-driver";
import { CodeOf } from "@cubux/types";

export type ConfigStorage = StoreDriverSingle<string, any>;

export type FilesStorageKey = CodeOf<"FilesStorageItem">;
export interface FilesStorageItem {
  key: FilesStorageKey;
  fileBuffer: ArrayBuffer;
}
export type FilesStorage = StoreDriver<string, FilesStorageItem>;

export interface OpenFileDoneItem {
  file: File;
  key?: FilesStorageKey;
}
export type OpenFileDoneCallback = (items: readonly OpenFileDoneItem[]) => void;
export interface OpenFileOptions {
  multiple?: boolean;
  done: OpenFileDoneCallback;
}
