import { createEffect, createEvent, createStore, sample } from "effector";
import { ReactElement, ReactNode } from "react";
import * as RoMap from "@cubux/readonly-map";
import { IdOf } from "@cubux/types";
import { ColorType } from "ui/types";
import { EMPTY_MAP } from "utils/data";

export interface ToastMessage {
  message: ReactNode;
  icon?: ReactElement;
  color?: ColorType;
}

const APPEAR_TIMEOUT = 50;
const SHOW_TIMEOUT = 7000;
const DISAPPEAR_TIMEOUT = 500;

export const showToast = createEvent<ToastMessage>();
export const showToastError = createEvent<unknown>();
sample({
  clock: showToastError,
  filter: (e): e is Error | string =>
    e instanceof Error || typeof e === "string",
  fn: (e: Error | string) => ({
    message: e instanceof Error ? e.message : e,
    color: ColorType.DANGER,
    // TODO: longer timeout?
  }),
  target: showToast,
});
const showToastErrorWrapFx = createEffect(
  ({ message, error }: { message: ReactNode; error: unknown }) => {
    showToast({
      message: (
        <>
          {message}: {error instanceof Error ? error.message : "Unknown error"}
        </>
      ),
      color: ColorType.DANGER,
    });
  },
);
export const showToastErrorWrap = (message: ReactNode, error: unknown) =>
  void showToastErrorWrapFx({ message, error });

export const enum ToastPhase {
  APPEAR,
  SHOWN,
  DISAPPEAR,
}

type ID = IdOf<"ToastInstance">;
export interface ToastInstance {
  id: ID;
  toast: ToastMessage;
  phase: ToastPhase;
}

const nextId = (() => {
  let id = 0;
  return () => ++id as ID;
})();

const createToast = showToast.map<ToastInstance>((toast) => ({
  id: nextId(),
  toast,
  phase: ToastPhase.APPEAR,
}));

export const toastDidShown = createEvent<ID>();
const toastShown = createEvent<ID>();
const toastDisappear = createEvent<ID>();
const toastRemove = createEvent<ID>();

export const $toasts = createStore<ReadonlyMap<number, ToastInstance>>(
  EMPTY_MAP,
)
  .on(createToast, (map, instance) => RoMap.set(map, instance.id, instance))
  .on(toastShown, (map, id) =>
    RoMap.update(map, id, (instance) =>
      instance.phase === ToastPhase.APPEAR
        ? { ...instance, phase: ToastPhase.SHOWN }
        : instance,
    ),
  )
  .on(toastDisappear, (map, id) =>
    RoMap.update(map, id, (instance) => ({
      ...instance,
      phase: ToastPhase.DISAPPEAR,
    })),
  )
  .on(toastRemove, RoMap.remove);

toastDidShown.watch((id) => setTimeout(() => toastShown(id), APPEAR_TIMEOUT));
toastShown.watch((id) => setTimeout(() => toastDisappear(id), SHOW_TIMEOUT));
toastDisappear.watch((id) =>
  setTimeout(() => toastRemove(id), DISAPPEAR_TIMEOUT),
);
