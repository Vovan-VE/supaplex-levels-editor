import { createEvent } from "effector";

export const onDeactivate = createEvent<any>();

function handleSuspend() {
  onDeactivate();
}
function handleVisChange() {
  if (window.document.visibilityState === "hidden") {
    onDeactivate();
  }
}

export const init = () => {
  window.document.addEventListener("visibilitychange", handleVisChange);
  window.addEventListener("pagehide", handleSuspend);
  window.addEventListener("beforeunload", handleSuspend);
};
