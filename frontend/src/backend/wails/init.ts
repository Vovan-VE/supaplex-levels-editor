import { sample } from "effector";
import { Browser, Events } from "@wailsio/runtime";
import { showToastError } from "models/ui/toasts";
import {
  frontEventsHandlers,
  onShowError,
  onUpgradeAvailable,
} from "./trigger";

export const init = () => {
  for (const [name, handler] of Object.entries(frontEventsHandlers)) {
    Events.On(name, handler);
  }

  sample({
    source: onShowError,
    target: showToastError,
  });

  window.document.body.addEventListener("click", (e) => {
    if (!e.defaultPrevented) {
      const tr = e.target;
      if (tr instanceof HTMLElement) {
        for (let el: HTMLElement | null = tr; el; el = el.parentElement) {
          if (el.matches("a[href]")) {
            Browser.OpenURL(el.getAttribute("href")!);
            e.preventDefault();
            return;
          }
        }
      }
    }
  });

  const w = window as { spleLatestVersion?: unknown };
  if (typeof w.spleLatestVersion === "string") {
    onUpgradeAvailable(w.spleLatestVersion);
  }
};
