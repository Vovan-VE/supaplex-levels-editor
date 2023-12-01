import { FC } from "react";
import { useStore } from "effector-react";
import { getDriver, LevelConfiguratorEnvProps } from "drivers";
import {
  $currentDriverName,
  $currentLevelUndoQueue,
  updateCurrentLevel,
} from "models/levelsets";

interface Props extends LevelConfiguratorEnvProps {}

export const LevelDriverConfig: FC<Props> = (props) => {
  const driverName = useStore($currentDriverName)!;
  const { LevelConfigurator } = getDriver(driverName)!;
  const undoQueue = useStore($currentLevelUndoQueue)!;
  const rawLevel = undoQueue.current;

  return LevelConfigurator ? (
    <LevelConfigurator
      {...props}
      level={rawLevel}
      onChange={updateCurrentLevel}
    />
  ) : null;
};
