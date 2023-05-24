import { createEvent } from "effector";
import {
  WithPersistentFlushEvent,
  WithPersistentFlushFailEvent,
} from "@cubux/effector-persistent";
import { FlushEvents } from "./internal";

export const flushEvents: FlushEvents = {
  onFlushStart: createEvent<WithPersistentFlushEvent>(),
  onFlushDone: createEvent<WithPersistentFlushEvent>(),
  onFlushFail: createEvent<WithPersistentFlushFailEvent>(),
  onFlushFinally: createEvent<WithPersistentFlushEvent>(),
} as const;
