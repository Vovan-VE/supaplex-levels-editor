import { createStore } from "effector";
import * as RoSet from "@cubux/readonly-set";
import { flushEvents } from "./flushEvents";

const $flushesPending = createStore<ReadonlySet<symbol>>(new Set())
  .on(flushEvents.onFlushStart, (set, { id }) => RoSet.add(set, id))
  .on(flushEvents.onFlushFinally, (set, { id }) => RoSet.remove(set, id));
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
