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

interface Props {
  withUndo?: boolean;
}

export const EditToolbar: FC<Props> = ({ withUndo = true }) => {
  const undoQueue = useStore($currentLevelUndoQueue)!;
  const noSelection = !useStore($hasSelection);
  const clipboardSize = useStore($clipboardRegionSizeStr);

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
        title="Cut selection"
      />
      <Button
        icon={<svgs.Copy />}
        disabled={noSelection}
        onClick={handleCopy}
        title="Copy selection"
      />
      <Button
        icon={<svgs.Paste />}
        disabled={!clipboardSize}
        onClick={handlePaste}
        title={clipboardSize ? `Paste selection ${clipboardSize}` : undefined}
      />
      <Button
        icon={<svgs.DeleteSelection />}
        disabled={noSelection}
        onClick={handleDelete}
        title="Delete selection"
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
