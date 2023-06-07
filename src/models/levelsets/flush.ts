import { createStore } from "effector";
import { flushEvents } from "./flushEvents";

const $flushesPending = createStore(new Set<symbol>())
  // REFACT: RoSet
  .on(flushEvents.onFlushStart, (set, { id }) => new Set(set).add(id))
  .on(flushEvents.onFlushFinally, (set, { id }) => {
    const next = new Set(set);
    next.delete(id);
    return next;
  });
export const $isFlushPending = $flushesPending.map((set) => set.size > 0);

export const $flushError = createStore<Error | null>(null)
  .reset(flushEvents.onFlushDone)
  .on(flushEvents.onFlushFail, (e) => {
    if (e instanceof Error) {
      return e;
    }
    console.error("Unexpected type of error receiver from `onFlushFail`", e);
    return new Error("Unexpected type of error");
  });
