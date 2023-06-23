import { FC } from "react";
import { useStore } from "effector-react";
import { $currentLevelUndoQueue, redoCurrentLevel } from "models/levelsets";
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
import { displayHotKey, useHotKey } from "models/ui/hotkeys";
import {
  HK_COPY,
  HK_CUT,
  HK_DEL,
  HK_PASTE,
  HK_REDO,
} from "models/ui/hotkeys-defined";
import { Button, ToolbarSeparator } from "ui/button";
import { svgs } from "ui/icon";
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
  const undoQueue = useStore($currentLevelUndoQueue)!;
  const noSelection = !useStore($hasSelection);
  const clipboardSize = useStore($clipboardRegionSizeStr);

  useHotKey({
    shortcut: HK_REDO,
    handler: undoQueue.canRedo ? handleHotRedo : noopHandler,
  });

  useHotKey({ shortcut: HK_CUT, handler: handleHotCut, disabled: noSelection });
  useHotKey({
    shortcut: HK_COPY,
    handler: handleHotCopy,
    disabled: noSelection,
  });
  useHotKey({
    shortcut: HK_DEL,
    handler: handleHotDelete,
    disabled: noSelection,
  });
  useHotKey({
    shortcut: HK_PASTE,
    handler: handleHotPaste,
    disabled: !clipboardSize,
  });

  return (
    <>
      {isCompact || <UndoButton />}
      <Button
        icon={<svgs.Redo />}
        disabled={!undoQueue.canRedo}
        onClick={redoCurrentLevel}
        title={`Redo (${displayHotKey(HK_REDO)})`}
      />
      {isCompact || <ToolbarSeparator />}
      <Button
        icon={<svgs.Cut />}
        disabled={noSelection}
        onClick={handleCut}
        title={`Cut selection (${displayHotKey(HK_CUT)})`}
      />
      <Button
        icon={<svgs.Copy />}
        disabled={noSelection}
        onClick={handleCopy}
        title={`Copy selection (${displayHotKey(HK_COPY)})`}
      />
      <Button
        icon={<svgs.Paste />}
        disabled={!clipboardSize}
        onClick={handlePaste}
        title={
          clipboardSize
            ? `Paste selection ${clipboardSize} (${displayHotKey(HK_PASTE)})`
            : undefined
        }
      />
      <Button
        icon={<svgs.DeleteSelection />}
        disabled={noSelection}
        onClick={handleDelete}
        title={`Delete selection (${displayHotKey(HK_DEL)})`}
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
    </>
  );
};
