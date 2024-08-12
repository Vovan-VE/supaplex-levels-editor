import { combine } from "effector";
import { useList, useUnit } from "effector-react";
import { FC, Fragment, ReactElement } from "react";
import * as RoMap from "@cubux/readonly-map";
import { ILevelRegion } from "drivers";
import {
  $openedSelectionEdit,
  $selectionSize,
  cancelSelectionEdit,
  getSelectionContentFx,
  openSelectionEdit,
  submitSelectionEdit,
} from "models/levels/tools/_selection";
import {
  $currentFileRo,
  $currentLevelSize,
  $currentLevelUndoQueue,
  updateCurrentLevelByRegion,
} from "models/levelsets";
import { displayHotKey, HotKey, HotKeyShortcuts } from "models/ui/hotkeys";
import {
  ButtonDropdown,
  TextButton,
  Toolbar,
  ToolbarSeparator,
} from "ui/button";
import { svgs } from "ui/icon";
import { ColorType } from "ui/types";
import { EMPTY_MAP } from "utils/data";
import { isNotNull } from "utils/fn";
import { Dialog, renderPrompt } from "ui/feedback";
import {
  chess,
  flipH,
  flipV,
  gradient,
  maze,
  replace,
  rnd,
  SelectionEditor,
  shuffle,
  transpose,
} from "./selection-editors";
import cl from "./SelectionEditButton.module.scss";

interface EditorsGroup {
  // title?: string;
  editors: Record<string, SelectionEditor>;
}
const EDITORS: readonly EditorsGroup[] = [
  {
    editors: {
      // Have no idea which sort order should be here, and so decided to use
      // alphabetical order, while it's not so much items.
      chess,
      gradient,
      maze,
      replace,
      rnd,
    },
  },
  {
    editors: {
      flipH,
      flipV,
      transpose,
      shuffle,
    },
  },
];
const editorsMap = new Map(
  EDITORS.reduce<[string, SelectionEditor][]>(
    (r, g) => [...r, ...Object.entries(g.editors)],
    [],
  ),
);

const _$workSize = combine(
  $selectionSize,
  $currentLevelSize,
  (sel, lvl) => sel || lvl,
);
const $cannotWork = _$workSize.map((size) =>
  size
    ? RoMap.filter(
        RoMap.map(
          editorsMap,
          ({ cannotWorkWhy }) => cannotWorkWhy?.(size) ?? null,
        ),
        isNotNull,
      )
    : EMPTY_MAP,
);

const runs = RoMap.map(
  editorsMap,
  ({ title, instant, Component, dialogSize }, name) =>
    async () => {
      let region = await getSelectionContentFx();
      const isSelection = !!region;
      if (!region) {
        const q = $currentLevelUndoQueue.getState();
        if (q) {
          const level = q.current;
          region = level.copyRegion({
            x: 0,
            y: 0,
            width: level.width,
            height: level.height,
          });
        }
      }
      if (!region) return;
      let result: ILevelRegion | null | undefined = undefined;
      if (Component) {
        openSelectionEdit(name);
        let unwatch: (() => void) | undefined;
        try {
          result = await renderPrompt<ILevelRegion>((props) => {
            const { show, onSubmit, onCancel } = props;
            unwatch = $openedSelectionEdit.updates.watch(
              (v) => v || onCancel(),
            );
            return (
              <Dialog
                open={show}
                onClose={onCancel}
                title={title}
                size={dialogSize ?? "small"}
              >
                <Component
                  region={region}
                  onSubmit={onSubmit}
                  onCancel={onCancel}
                />
              </Dialog>
            );
          });
        } finally {
          unwatch?.();
          cancelSelectionEdit();
        }
      } else if (instant) {
        result = instant(region);
      }
      if (!result) return;
      if (isSelection) {
        submitSelectionEdit(result);
      } else {
        updateCurrentLevelByRegion(result);
      }
    },
);

interface HKItem {
  name: string;
  hotkeys: HotKeyShortcuts;
  handler: () => void;
}
const $hotkeys = $cannotWork.map((cannotWork) => {
  const items: HKItem[] = [];
  for (const { editors } of EDITORS) {
    for (const [name, { hotkeys }] of Object.entries(editors)) {
      if (hotkeys && !cannotWork.has(name) && runs.has(name)) {
        items.push({ name, hotkeys, handler: runs.get(name)! });
      }
    }
  }
  return items;
});

export const SelectionEditHotKeys: FC = () => (
  <>
    {useList($hotkeys, ({ name, hotkeys, handler }) => (
      <HotKey key={name} shortcut={hotkeys} handler={handler} />
    ))}
  </>
);

export const SelectionEditMenu: FC = () => {
  const cannotWork = useUnit($cannotWork);

  return (
    <Toolbar isMenu>
      {EDITORS.map(({ editors }, i) => (
        <Fragment key={i}>
          {i > 0 && <ToolbarSeparator />}
          {Object.entries(editors).map(([name, { title, icon, hotkeys }]) => (
            <TextButton
              key={name}
              uiColor={ColorType.DEFAULT}
              icon={icon}
              disabled={cannotWork.has(name)}
              onClick={runs.get(name)}
              className={cl.btnItem}
            >
              <span className={cl.text}>
                {title} <Reason reason={cannotWork.get(name) || null} />
              </span>
              {hotkeys && (
                <kbd className={cl.hotkey}>{displayHotKey(hotkeys)}</kbd>
              )}
            </TextButton>
          ))}
        </Fragment>
      ))}
    </Toolbar>
  );
};

const Reason: FC<{ reason: ReactElement | null }> = ({ reason }) =>
  reason && <span className={cl.reason}>({reason})</span>;

export const SelectionEditButton: FC = () => {
  const isRo = useUnit($currentFileRo);
  return (
    <>
      {isRo || <SelectionEditHotKeys />}
      <ButtonDropdown
        triggerIcon={<svgs.EditSelection />}
        buttonProps={{ disabled: isRo }}
      >
        {isRo || <SelectionEditMenu />}
      </ButtonDropdown>
    </>
  );
};
