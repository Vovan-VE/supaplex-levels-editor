import { FC } from "react";
import { useStore } from "effector-react";
import { getDriver } from "drivers";
import {
  $currentDriverName,
  $currentLevelUndoQueue,
  updateCurrentLevel,
} from "models/levelsets";

interface Props {}

export const LevelDriverConfig: FC<Props> = () => {
  const driverName = useStore($currentDriverName)!;
  const { LevelConfigurator } = getDriver(driverName)!;
  const undoQueue = useStore($currentLevelUndoQueue)!;
  const rawLevel = undoQueue.current;

  return LevelConfigurator ? (
    <LevelConfigurator level={rawLevel} onChange={updateCurrentLevel} />
  ) : null;
};
