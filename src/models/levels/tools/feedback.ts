import { createEvent, createStore } from "effector";
import { CellCoords } from "./interface";

export const setFeedbackCell = createEvent<CellCoords>();
export const removeFeedbackCell = createEvent<any>();
export const $feedbackCell = createStore<CellCoords | null>(null)
  .reset(removeFeedbackCell)
  .on(setFeedbackCell, (_, c) => c);
