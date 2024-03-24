import { HotKeyMask, HotKeyShortcuts } from "./hotkeys";

export const HK_COPY: HotKeyShortcuts = [["C", HotKeyMask.CTRL], ["Copy"]];
export const HK_CUT: HotKeyShortcuts = [["X", HotKeyMask.CTRL], ["Cut"]];
export const HK_DEL: HotKeyShortcuts = [["Delete"], ["Clear"]];
export const HK_EDIT_CHESS: HotKeyShortcuts = [["C", HotKeyMask.SHIFT]];
export const HK_EDIT_FLIP_H: HotKeyShortcuts = [["H", HotKeyMask.SHIFT]];
export const HK_EDIT_FLIP_V: HotKeyShortcuts = [["V", HotKeyMask.SHIFT]];
export const HK_EDIT_GRADIENT: HotKeyShortcuts = [["G", HotKeyMask.SHIFT]];
export const HK_EDIT_MAZE: HotKeyShortcuts = [["M", HotKeyMask.SHIFT]];
export const HK_EDIT_RANDOM: HotKeyShortcuts = [["N", HotKeyMask.SHIFT]];
export const HK_EDIT_REPLACE: HotKeyShortcuts = [["R", HotKeyMask.SHIFT]];
export const HK_EDIT_SHUFFLE: HotKeyShortcuts = [["S", HotKeyMask.SHIFT]];
export const HK_PASTE: HotKeyShortcuts = [["V", HotKeyMask.CTRL], ["Paste"]];
export const HK_REDO: HotKeyShortcuts = [["Y", HotKeyMask.CTRL], ["Redo"]];
export const HK_TOOL_FLOOD: HotKeyShortcuts = [["F"]];
export const HK_TOOL_LINE: HotKeyShortcuts = [["L"]];
export const HK_TOOL_PEN: HotKeyShortcuts = [["1"]];
export const HK_TOOL_PEN2: HotKeyShortcuts = [["2"]];
export const HK_TOOL_PEN3: HotKeyShortcuts = [["3"]];
export const HK_TOOL_RECT: HotKeyShortcuts = [["R"]];
export const HK_TOOL_SELECTION: HotKeyShortcuts = [["S"]];
export const HK_UNDO: HotKeyShortcuts = [["Z", HotKeyMask.CTRL], ["Undo"]];
export const HK_ZOOM_IN: HotKeyShortcuts = [
  // Num pad <+>
  ["+", HotKeyMask.CTRL],
  // regular "=" which has "+" with <Shift>
  ["=", HotKeyMask.CTRL],
  ["ZoomIn"],
];
export const HK_ZOOM_OUT: HotKeyShortcuts = [
  ["-", HotKeyMask.CTRL],
  ["ZoomOut"],
];
