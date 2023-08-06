import { sample } from "effector";
import { showToastError } from "models/ui/toasts";
import { BrowserOpenURL, EventsOn } from "./runtime";
import {
  frontEventsHandlers,
  onShowError,
  onUpgradeAvailable,
} from "./trigger";

export const init = () => {
  const w: any = window;
  for (const [name, handler] of Object.entries(frontEventsHandlers)) {
    EventsOn(name, handler);
  }

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
