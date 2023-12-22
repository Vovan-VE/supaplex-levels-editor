import { useUnit } from "effector-react";
import { FC, useMemo } from "react";
import {
  $currentBuffer,
  $currentOpenedIndices,
  setCurrentLevel,
} from "models/levelsets";
import { TabItem, TabsButtons } from "ui/button";
import { ContainerProps } from "ui/types";
import { fmtLevelShort } from "../fmt";

export const LevelsTabs: FC<ContainerProps> = (props) => {
  const levelset = useUnit($currentBuffer)!;
  const openedIndices = useUnit($currentOpenedIndices);

  const levelsCount = levelset.levels.length;
  const levelsCountDigits = String(levelsCount).length;

  const tabs = useMemo(
    () =>
      openedIndices?.map(
        (n): TabItem<number> => ({
          key: n,
          text: fmtLevelShort(
            n,
            levelsCountDigits,
            levelset.levels[n].undoQueue.current.title,
          ),
        }),
      ) || [],
    [openedIndices, levelsCountDigits, levelset],
  );

  return (
    <TabsButtons
      {...props}
      tabs={tabs}
      current={levelset.currentIndex}
      onClick={setCurrentLevel}
    />
  );
};
