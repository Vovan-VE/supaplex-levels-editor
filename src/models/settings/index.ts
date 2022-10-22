import { createEvent, createStore } from "effector";
import { withPersistent } from "@cubux/effector-persistent";
import { localStorageDriver } from "../_utils/persistent";

export const openSettings = createEvent<any>();
export const closeSettings = createEvent<any>();
export const $opened = createStore(false)
  .reset(closeSettings)
  .on(openSettings, () => true);

export const setPrefAskTestSO = createEvent<boolean>();
export const $prefConfirmedTestSO = withPersistent(
  createStore(false),
  localStorageDriver,
  "prefConfirmTestSO",
).on(setPrefAskTestSO, (_, v) => v);

export const setCoordsDisplayBasis = createEvent<0 | 1>();
export const $coordsDisplayBasis = withPersistent(
  createStore<0 | 1>(0),
  localStorageDriver,
  "coordsBasis",
  { unserialize: (v) => (v ? 1 : 0) },
).on(setCoordsDisplayBasis, (_, v) => v);
