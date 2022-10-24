import { FC } from "react";
import { useStore } from "effector-react";
import { $currentLevelUndoQueue, redoCurrentLevel } from "models/levelsets";
import { Button, ToolbarSeparator } from "ui/button";
import { svgs } from "ui/icon";
import { TestingButtons } from "./TestingButtons";
import { UndoButton } from "./UndoButton";

interface Props {
  withUndo?: boolean;
}

export const EditToolbar: FC<Props> = ({ withUndo = true }) => {
  const undoQueue = useStore($currentLevelUndoQueue)!;

  return (
    <>
      {withUndo && <UndoButton />}
      <Button
        icon={<svgs.Redo />}
        disabled={!undoQueue.canRedo}
        onClick={redoCurrentLevel}
      />
      <ToolbarSeparator />
      {/*<Button icon={<svgs.Cut />} disabled />*/}
      {/*<Button icon={<svgs.Copy />} disabled />*/}
      {/*<Button icon={<svgs.Paste />} disabled />*/}
      {/*<Button icon={<svgs.DeleteSelection />} disabled />*/}
      {/*<Button disabled>PNG</Button>*/}
      {/*<ToolbarSeparator />*/}
      {/*<Button disabled>Copy level to clipboard</Button>*/}
      {/*<Button disabled>Paste level from clipboard</Button>*/}
      {/*<Button disabled>Internal/System clipboard? (via textarea?)</Button>*/}
      <TestingButtons />
    </>
  );
};
