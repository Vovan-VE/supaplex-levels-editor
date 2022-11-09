import { createEvent, createStore, sample } from "effector";
import { IBaseLevel, Interaction } from "drivers";
import { currentKeyWillGone, currentLevelIndexWillGone } from "../levelsets";

type I = Interaction<IBaseLevel>;
interface R {
  i: I;
  k: number;
}

const newKey = (() => {
  let n = 0;
  return () => ++n;
})();

export const addInteraction = createEvent<I | undefined>();
export const removeInteraction = createEvent<I>();

export const $interactions = createStore<readonly R[]>([])
  .reset(currentKeyWillGone, currentLevelIndexWillGone)
  .on(
    sample({
      source: addInteraction,
      filter: Boolean,
      fn: (i): R => ({ i, k: newKey() }),
    }),
    (list, i) => [...list, i],
  )
  .on(removeInteraction, (list, i) => list.filter((c) => c.i !== i));
