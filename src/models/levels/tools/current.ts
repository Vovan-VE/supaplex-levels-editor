import { combine, createEvent, createStore, sample } from "effector";
import { $currentKey, $currentLevelIndex } from "../../levelsets";
import { Tool } from "./interface";
import { PEN } from "./_pen";
import { FLOOD } from "./_flood";
import { RECT } from "./_rect";
import { SELECTION } from "./_selection";

export const setTool = createEvent<number>();
export const setToolVariant = createEvent<number>();
export const rollbackWork = createEvent<any>();

export const TOOLS: readonly Tool[] = [PEN, FLOOD, RECT, SELECTION];

const setToolInternal = createEvent<number>();
export const $toolIndex = createStore(0).on(setToolInternal, (_, n) => n);
const willSetTool = sample({
  clock: setTool,
  source: $toolIndex,
  filter: (prev, next) => next >= 0 && next < TOOLS.length && next !== prev,
  fn: (_, next) => next,
});
const toolWillUnset = sample({
  clock: willSetTool,
  source: $toolIndex,
});
toolWillUnset.watch((index) => {
  const { free } = TOOLS[index];
  free?.();
});
willSetTool.watch((index) => {
  const { init } = TOOLS[index];
  init?.();
  setToolInternal(index);
});

const _$singleVariant = createStore(0);
export const $toolsVariants = combine(
  TOOLS.map(({ $variant = _$singleVariant }) => $variant),
);
export const $toolVariant = combine(
  $toolsVariants,
  $toolIndex,
  (variants, index) => variants[index],
);
export const $toolUI = combine(
  combine(TOOLS.map(({ $ui }) => $ui)),
  $toolIndex,
  (UIs, index) => UIs[index],
);

// current file or level probably can be changed on touch screen with secondary
// touch, so rollback current tool work if any
sample({
  clock: [$currentLevelIndex.updates, $currentKey.updates, rollbackWork],
  source: $toolIndex,
}).watch((index) => {
  const { $ui } = TOOLS[index];
  const { rollback } = $ui.getState();
  rollback?.();
});

sample({
  clock: setToolVariant,
  source: $toolIndex,
  fn: (index, variant) => ({ index, variant }),
}).watch(({ index, variant }) => {
  const { setVariant } = TOOLS[index];
  setVariant?.(variant);
});
