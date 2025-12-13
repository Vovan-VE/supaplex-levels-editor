import { FC } from "react";
import { useUnit } from "effector-react";
import { getDriver, LevelConfiguratorEnvProps } from "drivers";
import {
  $currentDriverName,
  $currentFileRo,
  $currentLevelUndoQueue,
  updateCurrentLevel,
} from "models/levelsets";

export const LevelDriverConfig: FC<LevelConfiguratorEnvProps> = (props) => {
  const driverName = useUnit($currentDriverName)!;
  const { LevelConfigurator } = getDriver(driverName)!;
  const undoQueue = useUnit($currentLevelUndoQueue)!;
  const rawLevel = undoQueue.current;
  const isRo = useUnit($currentFileRo);

  return LevelConfigurator ? (
    <LevelConfigurator
      {...props}
      level={rawLevel}
      onChange={isRo ? undefined : updateCurrentLevel}
    />
  ) : null;
};
