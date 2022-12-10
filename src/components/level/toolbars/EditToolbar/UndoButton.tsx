import { useStoreMap } from "effector-react";
import { FC } from "react";
import { $currentLevelUndoQueue, undoCurrentLevel } from "models/levelsets";
import {
  displayHotKey,
  HotKeyMask,
  HotKeyShortcut,
  useHotKey,
} from "models/ui/hotkeys";
import { Button } from "ui/button";
import { svgs } from "ui/icon";

const HK_UNDO: HotKeyShortcut = ["Z", HotKeyMask.CTRL];
const handleHotUndo = (e: UIEvent) => {
  e.preventDefault();
  undoCurrentLevel();
};
const noopHandler = (e: UIEvent) => {
  e.preventDefault();
};

export const UndoButton: FC = () => {
  const canUndo = useStoreMap($currentLevelUndoQueue, (q) =>
    Boolean(q?.canUndo),
  );

  useHotKey({
    shortcut: HK_UNDO,
    handler: canUndo ? handleHotUndo : noopHandler,
  });

  return (
    <Button
      icon={<svgs.Undo />}
      disabled={!canUndo}
      onClick={undoCurrentLevel}
      title={`Redo (${displayHotKey(HK_UNDO)})`}
    />
  );
};
