import { sample } from "effector";
import { showToastError } from "models/ui/toasts";
import { BrowserOpenURL } from "./runtime";
import {
  onShowError,
  onUpgradeAvailable,
  spleFrontError,
  spleFrontEvent,
} from "./trigger";

export const init = () => {
  const w: any = window;
  w.spleFrontError = spleFrontError;
  w.spleFrontEvent = spleFrontEvent;

  sample({
    source: onShowError,
    target: showToastError,
  });

  window.document.body.addEventListener("click", (e) => {
    if (!e.defaultPrevented) {
      let tr = e.target;
      if (tr instanceof HTMLElement) {
        for (let el: HTMLElement | null = tr; el; el = el.parentElement) {
          if (el.matches("a[href]")) {
            BrowserOpenURL(el.getAttribute("href")!);
            e.preventDefault();
            return;
          }
        }
      }
    }
  });

  if (typeof w.spleLatestVersion === "string") {
    onUpgradeAvailable(w.spleLatestVersion);
  }
};
