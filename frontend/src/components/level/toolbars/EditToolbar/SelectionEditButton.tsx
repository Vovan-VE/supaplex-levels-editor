import { combine } from "effector";
import { useList, useUnit } from "effector-react";
import { FC, Fragment, ReactElement } from "react";
import * as RoMap from "@cubux/readonly-map";
import { ILevelRegion } from "drivers";
import {
  $hasSelection,
  $openedSelectionEdit,
  $selectionSize,
  cancelSelectionEdit,
  getSelectionContentFx,
  openSelectionEdit,
  submitSelectionEdit,
} from "models/levels/tools/_selection";
import { $currentFileRo } from "models/levelsets";
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
    },
    // rotate?
  },
];
const editorsMap = new Map(
  EDITORS.reduce<[string, SelectionEditor][]>(
    (r, g) => [...r, ...Object.entries(g.editors)],
    [],
  ),
);

const $cannotWork = $selectionSize.map((size) =>
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

const $run = $selectionSize.map((size) =>
  size
    ? RoMap.map(
        editorsMap,
        ({ title, instant, Component, dialogSize }, name) =>
          async () => {
            const region = await getSelectionContentFx();
            if (region) {
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

              if (result) {
                submitSelectionEdit(result);
              }
            }
          },
      )
    : EMPTY_MAP,
);

interface HKItem {
  name: string;
  hotkeys: HotKeyShortcuts;
  handler: () => any;
}
const $hotkeys = combine(
  $hasSelection,
  $cannotWork,
  $run,
  (hasSelection, cannotWork, run) => {
    const items: HKItem[] = [];
    if (hasSelection) {
      for (const { editors } of EDITORS) {
        for (const [name, { hotkeys }] of Object.entries(editors)) {
          if (hotkeys && !cannotWork.has(name) && run.has(name)) {
            items.push({ name, hotkeys, handler: run.get(name)! });
          }
        }
      }
    }
    return items;
  },
);

export const SelectionEditHotKeys: FC = () => (
  <>
    {useList($hotkeys, ({ name, hotkeys, handler }) => (
      <HotKey key={name} shortcut={hotkeys} handler={handler} />
    ))}
  </>
);

export const SelectionEditMenu: FC = () => {
  const hasSelection = useUnit($hasSelection);

  const cannotWork = useUnit($cannotWork);
  const run = useUnit($run);

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
              disabled={!hasSelection || cannotWork.has(name)}
              onClick={run.get(name)}
              className={cl.btnItem}
            >
              <span className={cl.text}>
                {title}{" "}
                <Reason
                  reason={(hasSelection && cannotWork.get(name)) || null}
                />
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
        buttonProps={{ disabled: !useUnit($hasSelection) || isRo }}
      >
        {isRo || <SelectionEditMenu />}
      </ButtonDropdown>
    </>
  );
};
