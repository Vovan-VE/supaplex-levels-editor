import { createEvent, createStore } from "effector";
import { withPersistent } from "@cubux/effector-persistent";
import { localStorageDriver } from "../_utils/persistent";

export const setPrefAskTestSO = createEvent<boolean>();
export const $prefConfirmedTestSO = withPersistent(
  createStore(false),
  localStorageDriver,
  "prefConfirmTestSO",
).on(setPrefAskTestSO, (_, v) => v);
