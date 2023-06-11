import { createEvent } from "effector";
import {
  WithPersistentFlushEvent,
  WithPersistentFlushFailEvent,
} from "@cubux/effector-persistent";

export const flushEvents = {
  onFlushStart: createEvent<WithPersistentFlushEvent>(),
  onFlushDone: createEvent<WithPersistentFlushEvent>(),
  onFlushFail: createEvent<WithPersistentFlushFailEvent>(),
  onFlushFinally: createEvent<WithPersistentFlushEvent>(),
} as const;
