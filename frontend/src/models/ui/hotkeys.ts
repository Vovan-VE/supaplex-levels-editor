import { combine, createEvent, createStore, sample } from "effector";
import { createGate } from "effector-react";
import { FC, useEffect } from "react";
import * as RoMap from "@cubux/readonly-map";

export const enum HotKeyMask {
  CTRL = 1,
  SHIFT = 2,
  ALT = 4,
}
const MASK_META = 8;
const getModMask = (e: KeyboardEvent) =>
  (e.metaKey ? MASK_META : 0) |
  (e.altKey ? HotKeyMask.ALT : 0) |
  (e.shiftKey ? HotKeyMask.SHIFT : 0) |
  (e.ctrlKey ? HotKeyMask.CTRL : 0);

const SKIP_ELEMENTS = new Set(["INPUT", "TEXTAREA", "SELECT"]);
const skipElement = (element: Element) => SKIP_ELEMENTS.has(element.tagName);

/**
 * `key` -> <https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values>
 */
type HotKeyShortcut = readonly [key: string, mask?: number];
/**
 * Single or several shortcuts. The first will be used to display when needed.
 */
export type HotKeyShortcuts = HotKeyShortcut | readonly HotKeyShortcut[];
const _isSingle = (hk: HotKeyShortcuts): hk is HotKeyShortcut =>
  hk.length === 2 && typeof hk[0] === "string";

export const displayHotKey = (hk: HotKeyShortcuts) => {
  const [key, mask = 0] = _isSingle(hk) ? hk : hk[0];
  let s = "";
  if (mask & HotKeyMask.CTRL) {
    s += "Ctrl+";
  }
  if (mask & HotKeyMask.ALT) {
    s += "Alt+";
  }
  if (mask & HotKeyMask.SHIFT) {
    s += "Shift+";
  }
  s += key === " " ? "Space" : key;
  return s;
};
const eventKeyString = (eventKey: string) =>
  /^[A-Z]$/i.test(eventKey) ? eventKey.toUpperCase() : eventKey;
const shortcutToString = ([key, mask = 0]: HotKeyShortcut) =>
  `${eventKeyString(key)}\t${mask}`;
const eventToShortcutString = (e: KeyboardEvent) =>
  shortcutToString([eventKeyString(e.key), getModMask(e)]);

type Consumer = (e: KeyboardEvent) => void;
interface HotkeyRef {
  shortcut: HotKeyShortcuts;
  // TODO: Make optional with `preventDefault`
  handler: Consumer;
  // TODO: add `preventDefault` to auto `preventDefault()`,
  //   then different flag should be used to "immediate stop propagation" instead
  //   of `defaultPrevented` in real handler below
}
interface HotkeyRegister extends HotkeyRef {
  prepend?: boolean;
}
export interface HotkeyHook extends HotkeyRegister {
  disabled?: boolean;
}

export const HotkeysManagerGate = createGate();
const addHotkey = createEvent<HotkeyRegister>();
const removeHotkey = createEvent<HotkeyRef>();
export const useHotKey = ({
  shortcut,
  handler,
  prepend = false,
  disabled = false,
}: HotkeyHook) =>
  useEffect(() => {
    if (disabled) {
      return;
    }
    addHotkey({ shortcut, handler, prepend });
    return () => {
      removeHotkey({ shortcut, handler });
    };
  }, [shortcut, handler, prepend, disabled]);

export const HotKey: FC<HotkeyHook> = (props) => {
  useHotKey(props);
  return null;
};

const $consumers = createStore<ReadonlyMap<string, readonly Consumer[]>>(
  new Map(),
)
  .on(addHotkey, (map, { shortcut, handler, prepend }) =>
    (_isSingle(shortcut) ? [shortcut] : shortcut).reduce(
      (map, shortcut) =>
        RoMap.updateDefault(map, shortcutToString(shortcut), [], (list) =>
          prepend ? [handler, ...list] : [...list, handler],
        ),
      map,
    ),
  )
  .on(removeHotkey, (map, { shortcut, handler }) =>
    RoMap.filter(
      (_isSingle(shortcut) ? [shortcut] : shortcut).reduce(
        (map, shortcut) =>
          RoMap.update(map, shortcutToString(shortcut), (list) =>
            list.filter((h) => h !== handler),
          ),
        map,
      ),
      (list) => list.length,
    ),
  );

const handleKeyDown = createEvent<KeyboardEvent>();
sample({
  source: sample({
    clock: sample({
      source: handleKeyDown,
      filter: (e) =>
        !(e.target instanceof HTMLElement && skipElement(e.target)),
    }),
    source: $consumers,
    filter: HotkeysManagerGate.status,
    fn: (map, e) => {
      const handlers = map.get(eventToShortcutString(e));
      return handlers?.length ? ([e, handlers] as const) : null;
    },
  }),
  filter: Boolean,
}).watch(([e, handlers]) => {
  for (const handler of handlers) {
    handler(e);
    // Without `Effect`s this all runs in single thread, and here
    // `preventDefault()` actually works.
    //
    // Probably, here should be a different flag to skip all the rest handlers
    // in list, when `defaultPrevented` start to cause issues.
    if (e.defaultPrevented) {
      break;
    }
  }
});

combine(
  HotkeysManagerGate.status,
  $consumers.map((map) => map.size > 0),
  (...bs) => bs.every(Boolean),
).watch((needToListen) => {
  if (needToListen) {
    window.document.addEventListener("keydown", handleKeyDown);
  } else {
    window.document.removeEventListener("keydown", handleKeyDown);
  }
});
