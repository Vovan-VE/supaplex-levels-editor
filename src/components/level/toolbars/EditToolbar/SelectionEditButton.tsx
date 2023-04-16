import { useStore } from "effector-react";
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
                let unwatch: () => void;
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
                  unwatch!?.();
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

export const SelectionEditButton: FC = () => {
  const hasSelection = useStore($hasSelection);

  const cannotWork = useStore($cannotWork);
  const run = useStore($run);

  return (
    <>
      <ButtonDropdown
        triggerIcon={<svgs.EditSelection />}
        buttonProps={{ disabled: !hasSelection }}
      >
        <Toolbar isMenu>
          {EDITORS.map(({ editors }, i) => (
            <Fragment key={i}>
              {i > 0 && <ToolbarSeparator />}
              {Object.entries(editors).map(([name, { title, icon }]) => (
                <TextButton
                  key={name}
                  uiColor={ColorType.DEFAULT}
                  icon={icon}
                  disabled={!hasSelection || cannotWork.has(name)}
                  onClick={run.get(name)}
                >
                  {title}{" "}
                  <Reason
                    reason={(hasSelection && cannotWork.get(name)) || null}
                  />
                </TextButton>
              ))}
            </Fragment>
          ))}
        </Toolbar>
      </ButtonDropdown>
    </>
  );
};

const Reason: FC<{ reason: ReactElement | null }> = ({ reason }) =>
  reason && <span>({reason})</span>;
