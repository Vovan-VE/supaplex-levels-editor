import { createEvent, createStore, restore } from "effector";
import { withPersistent } from "@cubux/effector-persistent";
import { $instanceIsReadOnly, allowManualSave, configStorage } from "backend";

export const openSettings = createEvent<any>();
export const closeSettings = createEvent<any>();
export const $opened = restore(
  openSettings.map(() => true),
  false,
).reset(closeSettings);

const ro = $instanceIsReadOnly ? { readOnly: $instanceIsReadOnly } : undefined;

export const setPrefAskTestSO = createEvent<boolean>();
export const $prefConfirmedTestSO = withPersistent(
  restore(setPrefAskTestSO, false),
  configStorage,
  "prefConfirmTestSO",
  {
    ...ro,
    unserialize: Boolean,
  },
);

export const setCoordsDisplayBasis = createEvent<0 | 1>();
export const $coordsDisplayBasis = withPersistent(
  restore(setCoordsDisplayBasis, 0),
  configStorage,
  "coordsBasis",
  {
    ...ro,
    unserialize: (v) => (v ? 1 : 0),
  },
);

export enum LayoutType {
  AUTO = "auto",
  COMPACT = "compact",
  FULL = "full",
}
const isLayoutType = (v: any): v is LayoutType =>
  typeof v === "string" && LayoutType.hasOwnProperty(v);
export const setLayoutType = createEvent<LayoutType>();
export const $layoutType = withPersistent(
  restore(setLayoutType, LayoutType.AUTO),
  configStorage,
  "layout",
  {
    ...ro,
    unserialize: (v) => (isLayoutType(v) ? v : LayoutType.AUTO),
  },
);

type SpChipType = 0 | 1;
const isSpChipType = (v: any): v is SpChipType =>
  typeof v === "number" && Number.isInteger(v) && v >= 0 && v <= 1;
export const setSpChip = createEvent<SpChipType>();
export const $spChip = withPersistent(
  restore(setSpChip, 0),
  configStorage,
  "spChip",
  {
    ...ro,
    unserialize: (v) => (isSpChipType(v) ? v : 0),
  },
);

export const setAutoSave = createEvent<boolean>();
export const $autoSave = allowManualSave
  ? withPersistent(restore(setAutoSave, false), configStorage, "autoSave", {
      ...ro,
      unserialize: Boolean,
    })
  : // it's always true without manual save
    createStore(true);

export const AUTO_SAVE_DELAY_MIN = 5 * 1000;
export const AUTO_SAVE_DELAY_MAX = 30 * 60 * 1000;
export const AUTO_SAVE_DELAY_STEP = 5 * 1000;
const AUTO_SAVE_DELAY_DEF = 60 * 1000;
export const setAutoSaveDelay = createEvent<number>();
/**
 * Delay to flush changes to in-memory files after a changes was made. More
 * changes in sequence within this delay cause flush to delay more.
 */
export const $autoSaveDelay = allowManualSave
  ? withPersistent(
      restore(setAutoSaveDelay, AUTO_SAVE_DELAY_DEF),
      configStorage,
      "autoSaveDelay",
      {
        ...ro,
        unserialize: (s) => {
          const n = Number(s);
          return Number.isSafeInteger(n) &&
            n >= AUTO_SAVE_DELAY_MIN &&
            n <= AUTO_SAVE_DELAY_MAX
            ? n
            : AUTO_SAVE_DELAY_DEF;
        },
      },
    )
  : createStore(300);
