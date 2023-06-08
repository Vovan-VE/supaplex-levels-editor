import { sample } from "effector";
import { showToastError } from "models/ui/toasts";
import { onShowError, spleFrontError, spleFrontEvent } from "./trigger";

export const init = () => {
  const w: any = window;
  w.spleFrontError = spleFrontError;
  w.spleFrontEvent = spleFrontEvent;

  sample({
    source: onShowError,
    target: showToastError,
  });
};
