import { useUnit } from "effector-react";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import {
  $currentFileRo,
  $currentLevelUndoQueue,
  redoCurrentLevel,
} from "models/levelsets";
import { setToolO } from "models/levels/tools";
import {
  $clipboardRegionSizeStr,
  $hasSelection,
  copySelection,
  cutSelectionFx,
  deleteSelectionFx,
  pasteSelectionFx,
  SELECTION,
} from "models/levels/tools/_selection";
import { hintWithHotkey, useHotKey } from "models/ui/hotkeys";
import {
  HK_COPY,
  HK_CUT,
  HK_DEL,
  HK_PASTE,
  HK_REDO,
} from "models/ui/hotkeys-defined";
import { Button, ToolbarSeparator } from "ui/button";
import { svgs } from "ui/icon";
import { CmpLevelsButton } from "./CmpLevels";
import { FindPlayerButton } from "./FindPlayerButton";
import { SelectionEditButton } from "./SelectionEditButton";
import { StatsButton } from "./StatsButton";
import { TestingButtons } from "./TestingButtons";
import { UndoButton } from "./UndoButton";

const handleCut = () => cutSelectionFx();
const handleCopy = () => copySelection();
const handleDelete = () => deleteSelectionFx();
const handlePaste = () => {
  setToolO(SELECTION);
  return pasteSelectionFx();
};

const handleHotRedo = (e: UIEvent) => {
  e.preventDefault();
  redoCurrentLevel();
};
const handleHotCut = (e: UIEvent) => {
  e.preventDefault();
  handleCut();
};
const handleHotCopy = (e: UIEvent) => {
  e.preventDefault();
  handleCopy();
};
const handleHotDelete = (e: UIEvent) => {
  e.preventDefault();
  handleDelete();
};
const handleHotPaste = (e: UIEvent) => {
  e.preventDefault();
  handlePaste();
};
const noopHandler = (e: UIEvent) => {
  e.preventDefault();
};

interface Props {
  isCompact?: boolean;
}

export const EditToolbar: FC<Props> = ({ isCompact = false }) => {
  const { t } = useTranslation();
  const undoQueue = useUnit($currentLevelUndoQueue)!;
  const noSelection = !useUnit($hasSelection);
  const isRo = useUnit($currentFileRo);
  const clipboardSize = useUnit($clipboardRegionSizeStr);

  useHotKey({
    shortcut: HK_REDO,
    handler: undoQueue.canRedo && !isRo ? handleHotRedo : noopHandler,
  });

  useHotKey({
    shortcut: HK_CUT,
    handler: handleHotCut,
    disabled: noSelection || isRo,
  });
  useHotKey({
    shortcut: HK_COPY,
    handler: handleHotCopy,
    disabled: noSelection,
  });
  useHotKey({
    shortcut: HK_DEL,
    handler: handleHotDelete,
    disabled: noSelection || isRo,
  });
  useHotKey({
    shortcut: HK_PASTE,
    handler: handleHotPaste,
    disabled: !clipboardSize || isRo,
  });

  return (
    <>
      {isCompact || <UndoButton />}
      <Button
        icon={<svgs.Redo />}
        disabled={!undoQueue.canRedo || isRo}
        onClick={redoCurrentLevel}
        title={hintWithHotkey(t("main:edit.Redo"), HK_REDO)}
      />
      {isCompact || <ToolbarSeparator />}
      <Button
        icon={<svgs.Cut />}
        disabled={noSelection || isRo}
        onClick={handleCut}
        title={hintWithHotkey(t("main:edit.Cut"), HK_CUT)}
      />
      <Button
        icon={<svgs.Copy />}
        disabled={noSelection}
        onClick={handleCopy}
        title={hintWithHotkey(t("main:edit.Copy"), HK_COPY)}
      />
      <Button
        icon={<svgs.Paste />}
        disabled={!clipboardSize || isRo}
        onClick={handlePaste}
        title={
          clipboardSize
            ? hintWithHotkey(
                t("main:edit.Paste", { size: clipboardSize }),
                HK_PASTE,
              )
            : undefined
        }
      />
      <Button
        icon={<svgs.DeleteSelection />}
        disabled={noSelection || isRo}
        onClick={handleDelete}
        title={hintWithHotkey(t("main:edit.Delete"), HK_DEL)}
      />
      {isCompact || (
        <>
          <ToolbarSeparator />
          <SelectionEditButton />
        </>
      )}
      {isCompact || <ToolbarSeparator />}
      <TestingButtons />
      {isCompact || <ToolbarSeparator />}
      <FindPlayerButton />
      <StatsButton />
      <CmpLevelsButton />
    </>
  );
};
