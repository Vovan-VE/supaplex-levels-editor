import { createEvent, createStore, Event, sample } from "effector";
import { getDriver } from "drivers";
import { ask } from "ui/feedback";
import { DemoData, LevelsetFileKey } from "./types";
import { $currentDriverName, $currentKey, $levelsets } from "./files";
import {
  $currentLevelIndex,
  deleteCurrentLevel,
  insertAtCurrentLevel,
  internalUpdateLevelDemo,
} from "./buffers";
import { isOffsetInRange } from "../../utils/number";

export const $fileSupportsDemo = $currentDriverName.map(
  (driverName) => (driverName && getDriver(driverName)?.demoSupport) || false,
);

const decodeDemoMessage = (data: any): DemoData | null => {
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
      if (
        typeof data === "object" &&
        data &&
        data.hasOwnProperty("data") &&
        data.hasOwnProperty("seed_hi") &&
        data.hasOwnProperty("seed_lo") &&
        typeof data.data === "string" &&
        typeof data.seed_hi === "number" &&
        typeof data.seed_lo === "number" &&
        isOffsetInRange(data.seed_hi, 0, 256) &&
        isOffsetInRange(data.seed_lo, 0, 256)
      ) {
        return {
          data: Uint8Array.from(
            Array.from(window.atob(data.data)).map((s) => s.charCodeAt(0)),
          ),
          seed_hi: data.seed_hi,
          seed_lo: data.seed_lo,
        };
      }
    } catch {}
  }
  return null;
};

export const receivedDemoFromTest = createEvent<unknown>();

const _receivedDemo = sample({
  source: receivedDemoFromTest.map(decodeDemoMessage),
  filter: Boolean,
});

if (process.env.NODE_ENV === "development") {
  // since we cannot receive `postMessage()` sent to production origin,
  // we can "proxy" it manually
  (window as any).__DEV__receivedDemoFromTest = receivedDemoFromTest;
}

interface _DemoTargetNullable {
  fileKey: LevelsetFileKey | null;
  levelIndex: number | null;
}
interface _DemoTarget extends _DemoTargetNullable {
  fileKey: LevelsetFileKey;
  levelIndex: number;
}
const isDemoTarget = (s: _DemoTargetNullable): s is _DemoTarget =>
  Boolean(s.fileKey && s.levelIndex !== null);

const takeLevelRef = (clock: Event<any>) =>
  sample({
    clock,
    source: {
      fileKey: $currentKey,
      levelIndex: $currentLevelIndex,
    },
    filter: isDemoTarget,
  });

export const rememberDemoTarget = createEvent<any>();

const $demoTarget = createStore<_DemoTarget | null>(null)
  // remember last target to save demo to
  .on(takeLevelRef(rememberDemoTarget), (_, v) => v)
  // free when file is gone
  .on($levelsets, (cur, existing) =>
    cur && existing.has(cur.fileKey) ? cur : null,
  )
  // insert a level at current level pos
  .on(takeLevelRef(insertAtCurrentLevel), (cur, o) => {
    // in same file and before-or-same as remembered target?
    if (cur && cur.fileKey === o.fileKey && o.levelIndex <= cur.levelIndex) {
      return {
        ...cur,
        // demo target is shifting forward
        levelIndex: cur.levelIndex + 1,
      };
    }
  })
  // delete current level
  .on(takeLevelRef(deleteCurrentLevel), (cur, o) => {
    // in same file?
    if (cur && cur.fileKey === o.fileKey) {
      // same level as demo target?
      if (cur.levelIndex === o.levelIndex) {
        // free target
        return null;
      }
      // deleted level was before demo target
      if (o.levelIndex < cur.levelIndex) {
        return {
          ...cur,
          // demo target is shifting backward
          levelIndex: cur.levelIndex - 1,
        };
      }
    }
  });

sample({
  clock: _receivedDemo,
  source: $demoTarget,
  filter: Boolean,
  fn: (ref, demoData) => ({ ...ref, demoData }),
}).watch(async ({ fileKey, levelIndex, demoData }) => {
  let fileName = "";
  let levelName = "";
  const file = $levelsets.getState().get(fileKey);
  if (file) {
    fileName = file.name;
    levelName = file.levelset.getLevel(levelIndex)?.title ?? "";
  }

  if (
    await ask(
      <>
        A new demo ({demoData.data.length} bytes) received for level{" "}
        <code>#{levelIndex + 1}</code> (<code>{levelName}</code>) in file "
        <code>{fileName}</code>".
        <br />
        Save new demo?
      </>,
    )
  ) {
    internalUpdateLevelDemo({
      key: fileKey,
      index: levelIndex,
      demoData,
    });
  }
});
