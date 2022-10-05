import { combine, createEvent, createStore, sample } from "effector";
import { $currentKey, $currentLevelIndex } from "../../levelsets";
import { Tool } from "./interface";
import { PEN } from "./_pen";

export const setTool = createEvent<number>();
export const setToolVariant = createEvent<number>();
export const rollbackWork = createEvent<any>();

const TOOLS: readonly Tool[] = [PEN];

const setToolInternal = createEvent<number>();
const $toolIndex = createStore(0).on(setToolInternal, (_, n) => n);
const willSetTool = sample({
  clock: setTool,
  source: $toolIndex,
  filter: (next, prev) => next >= 0 && next < TOOLS.length && next !== prev,
});
const toolWillUnset = sample({
  clock: willSetTool,
  source: $toolIndex,
});
toolWillUnset.watch((index) => {
  const { free } = TOOLS[index];
  free();
});
willSetTool.watch((index) => {
  const { init } = TOOLS[index];
  init();
  setToolInternal(index);
});

const $toolsUIs = combine(TOOLS.map(({ $ui }) => $ui));
export const $toolUI = combine(
  $toolsUIs,
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
  rollback();
});

sample({
  clock: setToolVariant,
  source: $toolIndex,
  fn: (index, variant) => ({ index, variant }),
}).watch(({ index, variant }) => {
  const { setVariant } = TOOLS[index];
  setVariant(variant);
});
