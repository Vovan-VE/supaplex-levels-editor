import { useStoreMap } from "effector-react";
import { FC } from "react";
import { $currentLevelUndoQueue, undoCurrentLevel } from "models/levelsets";
import { Button } from "ui/button";
import { svgs } from "ui/icon";

export const UndoButton: FC = () => {
  const canUndo = useStoreMap($currentLevelUndoQueue, (q) =>
    Boolean(q?.canUndo),
  );

  return (
    <Button
      icon={<svgs.Undo />}
      disabled={!canUndo}
      onClick={undoCurrentLevel}
    />
  );
};
