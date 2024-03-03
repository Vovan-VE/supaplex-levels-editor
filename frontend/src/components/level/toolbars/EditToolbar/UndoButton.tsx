import { useStoreMap, useUnit } from "effector-react";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import {
  $currentFileRo,
  $currentLevelUndoQueue,
  undoCurrentLevel,
} from "models/levelsets";
import { hintWithHotkey, useHotKey } from "models/ui/hotkeys";
import { HK_UNDO } from "models/ui/hotkeys-defined";
import { Button } from "ui/button";
import { svgs } from "ui/icon";

const handleHotUndo = (e: UIEvent) => {
  e.preventDefault();
  undoCurrentLevel();
};
const noopHandler = (e: UIEvent) => {
  e.preventDefault();
};

export const UndoButton: FC = () => {
  const { t } = useTranslation();
  const isRo = useUnit($currentFileRo);
  const canUndo =
    useStoreMap($currentLevelUndoQueue, (q) => Boolean(q?.canUndo)) && !isRo;

  useHotKey({
    shortcut: HK_UNDO,
    handler: canUndo ? handleHotUndo : noopHandler,
  });

  return (
    <Button
      icon={<svgs.Undo />}
      disabled={!canUndo}
      onClick={undoCurrentLevel}
      title={hintWithHotkey(t("main:edit.Undo", "Undo"), HK_UNDO)}
    />
  );
};
