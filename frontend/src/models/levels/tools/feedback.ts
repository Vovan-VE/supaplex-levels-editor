import { createEvent, createStore } from "effector";
import { Point2D } from "utils/rect";

export const setFeedbackCell = createEvent<Point2D>();
export const removeFeedbackCell = createEvent<unknown>();
export const $feedbackCell = createStore<Point2D | null>(null)
  .reset(removeFeedbackCell)
  .on(setFeedbackCell, (_, c) => c);
