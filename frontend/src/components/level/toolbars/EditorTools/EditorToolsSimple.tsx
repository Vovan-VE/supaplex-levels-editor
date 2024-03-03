import { useUnit } from "effector-react";
import { TFunction } from "i18next";
import { FC, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  $toolIndex,
  $toolVariant,
  setTool,
  setToolVariant,
  TOOLS,
} from "models/levels/tools";
import { $currentFileRo } from "models/levelsets";
import {
  displayHotKey,
  HotKeyShortcuts,
  hotkeysList,
  shortcutToString,
  useHotKey,
} from "models/ui/hotkeys";
import { Button, Toolbar } from "ui/button";
import { ColorType, ContainerProps } from "ui/types";

interface ToolHK {
  hotkey: HotKeyShortcuts;
  canRo?: boolean;
  tvs: [tIndex: number, vIndex: number][];
}
const { TOOLS_HOTKEYS, IS_CYCLED } = (() => {
  const map = new Map<string, ToolHK>();
  for (const [ti, tool] of TOOLS.entries()) {
    const { variants, canRo } = tool;
    for (const [vi, { hotkey }] of variants.entries()) {
      if (hotkey) {
        for (const hk of hotkeysList(hotkey)) {
          const k = shortcutToString(hk);
          let thk = map.get(k);
          if (!thk) {
            thk = { hotkey, tvs: [], canRo };
            map.set(k, thk);
          }
          thk.tvs.push([ti, vi]);
        }
      }
    }
  }
  const TOOLS_HOTKEYS = Array.from(map.values());
  const IS_CYCLED = new Set(
    TOOLS_HOTKEYS.filter(({ tvs }) => tvs.length > 1).map(({ hotkey }) =>
      displayHotKey(hotkey),
    ),
  );
  return { TOOLS_HOTKEYS, IS_CYCLED };
})();

const _displayHK = (t: TFunction, hk: HotKeyShortcuts | undefined) => {
  if (!hk) {
    return "";
  }
  const s = displayHotKey(hk);
  return `\n<${s}>${
    IS_CYCLED.has(s) ? " " + t("main:common.labels.HotkeyCycledMarker") : ""
  }`;
};

const handleClicks = TOOLS.map(({ variants }, ti) =>
  variants.map((_, vi) => () => {
    setTool(ti);
    setToolVariant(vi);
  }),
);

export const EditorToolsSimple: FC<ContainerProps> = (props) => {
  const { t } = useTranslation();
  const toolIndex = useUnit($toolIndex);
  const variantIndex = useUnit($toolVariant);
  const isRo = useUnit($currentFileRo);
  return (
    <Toolbar {...props}>
      {TOOLS.map(({ variants, canRo }, ti) =>
        variants.map(({ title, Icon, hotkey }, vi) => (
          <Button
            key={`${ti}:${vi}`}
            icon={<Icon />}
            title={title(t) + _displayHK(t, hotkey)}
            uiColor={
              ti === toolIndex && vi === variantIndex
                ? ColorType.WARN
                : undefined
            }
            onClick={handleClicks[ti][vi]}
            disabled={isRo && !canRo}
          />
        )),
      )}

      {TOOLS_HOTKEYS.map(({ hotkey, tvs, canRo }, i) => {
        const curIndex = tvs.findIndex(
          ([ti, vi]) => ti === toolIndex && vi === variantIndex,
        );
        const activeIndex = curIndex >= 0 ? (curIndex + 1) % tvs.length : 0;
        return (
          <ToolHotKeyWatch
            key={i}
            hotkey={hotkey}
            tv={tvs[activeIndex]}
            disabled={activeIndex === curIndex || (isRo && !canRo)}
          />
        );
      })}
    </Toolbar>
  );
};

const ToolHotKeyWatch: FC<{
  hotkey: HotKeyShortcuts;
  tv: [tIndex: number, vIndex: number];
  disabled: boolean;
}> = ({ hotkey, tv: [ti, vi], disabled }) => {
  useHotKey({
    shortcut: hotkey,
    disabled,
    handler: useCallback(() => {
      setTool(ti);
      setToolVariant(vi);
    }, [ti, vi]),
  });
  return null;
};
