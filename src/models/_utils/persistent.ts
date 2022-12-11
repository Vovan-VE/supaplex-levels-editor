import { createEvent, createStore } from "effector";
import {
  WithPersistentFlushEvent,
  WithPersistentFlushFailEvent,
  WithPersistentOptions,
} from "@cubux/effector-persistent";
import { createLocalStorageDriver } from "@cubux/storage-driver";
import { APP_STORAGE_PREFIX } from "configs";

export const localStorageDriver = createLocalStorageDriver<any>({
  prefix: APP_STORAGE_PREFIX,
});

const onFlushStart = createEvent<WithPersistentFlushEvent>();
const onFlushDone = createEvent<WithPersistentFlushEvent>();
const onFlushFail = createEvent<WithPersistentFlushFailEvent>();
const onFlushFinally = createEvent<WithPersistentFlushEvent>();

export const flushEvents: WithPersistentOptions = {
  onFlushStart,
  onFlushDone,
  onFlushFail,
  onFlushFinally,
};

const $flushedPending = createStore(new Set<symbol>())
  .on(onFlushStart, (set, { id }) => new Set(set).add(id))
  .on(onFlushFinally, (set, { id }) => {
    const next = new Set(set);
    next.delete(id);
    return next;
  });
export const $isFlushPending = $flushedPending.map((set) => set.size > 0);

export const $flushError = createStore<Error | null>(null)
  .reset(onFlushDone)
  .on(onFlushFail, (e) => {
    if (e instanceof Error) {
      return e;
    }
    console.error("Unexpected type of error receiver from `onFlushFail`", e);
    return new Error("Unexpected type of error");
  });
