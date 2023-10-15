import type { StoreDriver, StoreDriverSingle } from "@cubux/storage-driver";
import { CodeOf } from "@cubux/types";

export type ConfigStorage = StoreDriverSingle<string, any>;

export type FilesStorageKey = CodeOf<"FilesStorageItem">;
export interface FilesStorageItem {
  key: FilesStorageKey;
  fileBuffer: ArrayBuffer;
}
export type FilesStorage = StoreDriver<string, FilesStorageItem>;

export interface OpenFileItem {
  file: File;
  key?: FilesStorageKey;
}
export type OpenFiles = readonly OpenFileItem[];
export type OpenFileDoneCallback = (items: OpenFiles) => void;
export interface OpenFileOptions {
  multiple?: boolean;
  done: OpenFileDoneCallback;
}
