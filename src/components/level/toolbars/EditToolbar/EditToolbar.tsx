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
import {
  displayHotKey,
  HotKeyMask,
  HotKeyShortcut,
  useHotKey,
} from "models/ui/hotkeys";
import { Button, ToolbarSeparator } from "ui/button";
import { svgs } from "ui/icon";
import { FindPlayerButton } from "./FindPlayerButton";
import { TestingButtons } from "./TestingButtons";
import { UndoButton } from "./UndoButton";

const handleCut = () => cutSelectionFx();
const handleCopy = () => copySelection();
const handleDelete = () => deleteSelectionFx();
const handlePaste = () => {
  setToolO(SELECTION);
  return pasteSelectionFx();
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

const HK_CUT: HotKeyShortcut = ["X", HotKeyMask.CTRL];
const HK_COPY: HotKeyShortcut = ["C", HotKeyMask.CTRL];
const HK_PASTE: HotKeyShortcut = ["V", HotKeyMask.CTRL];
const HK_DEL: HotKeyShortcut = ["Delete"];

interface Props {
  withUndo?: boolean;
}

export const EditToolbar: FC<Props> = ({ withUndo = true }) => {
  const undoQueue = useStore($currentLevelUndoQueue)!;
  const noSelection = !useStore($hasSelection);
  const clipboardSize = useStore($clipboardRegionSizeStr);

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
      {withUndo && <UndoButton />}
      <Button
        icon={<svgs.Redo />}
        disabled={!undoQueue.canRedo}
        onClick={redoCurrentLevel}
      />
      <ToolbarSeparator />
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
      {/*<Button disabled>PNG</Button>*/}
      <ToolbarSeparator />
      {/*<Button disabled>Copy level to clipboard</Button>*/}
      {/*<Button disabled>Paste level from clipboard</Button>*/}
      {/*<Button disabled>Internal/System clipboard? (via textarea?)</Button>*/}
      <TestingButtons />
      <ToolbarSeparator />
      <FindPlayerButton />
    </>
  );
};
