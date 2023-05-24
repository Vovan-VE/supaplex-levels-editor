import type { Event } from "effector";
import type {
  WithPersistentFlushEvent,
  WithPersistentFlushFailEvent,
} from "@cubux/effector-persistent";
import type { StoreDriver, StoreDriverSingle } from "@cubux/storage-driver";

export type ConfigStorage = StoreDriverSingle<string, any>;
export type FilesStorage = StoreDriver<string, any>;

export type OpenFileDoneCallback = (files: readonly File[]) => void;
export interface OpenFileOptions {
  multiple?: boolean;
  done: OpenFileDoneCallback;
}

export interface FlushEvents {
  readonly onFlushStart: Event<WithPersistentFlushEvent>;
  readonly onFlushDone: Event<WithPersistentFlushEvent>;
  readonly onFlushFail: Event<WithPersistentFlushFailEvent>;
  readonly onFlushFinally: Event<WithPersistentFlushEvent>;
}
