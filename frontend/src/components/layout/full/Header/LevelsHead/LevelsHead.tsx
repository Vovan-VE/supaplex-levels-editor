import { FC, useCallback, useMemo } from "react";
import cn from "classnames";
import { useUnit } from "effector-react";
import {
  fmtLevelFull,
  fmtLevelNumber,
  LevelsTabs,
  LevelsToolbar,
} from "components/levelset";
import { $currentBuffer, setCurrentLevel } from "models/levelsets";
import { Toolbar } from "ui/button";
import { Select, SelectOption } from "ui/input";
import { ContainerProps } from "ui/types";
import cl from "./LevelsHead.module.scss";

interface Props extends ContainerProps {}

export const LevelsHead: FC<Props> = ({ className, ...rest }) => {
  const levelset = useUnit($currentBuffer)!;

  const levelsCount = levelset.levels.length;
  const levelsCountDigits = String(levelsCount).length;

  const selectOptions = useMemo<SelectOption<number>[]>(
    () =>
      levelset.levels.map(({ undoQueue }, i) => ({
        value: i,
        label: fmtLevelFull(i, levelsCountDigits, undoQueue.current.title),
        labelSelected: `${fmtLevelNumber(
          i,
          levelsCountDigits,
        )} / ${levelsCount}`,
      })),
    [levelset.levels, levelsCount, levelsCountDigits],
  );
  const handleSelect = useCallback((o: SelectOption<number> | null) => {
    if (o) {
      setCurrentLevel(o.value);
    }
  }, []);

  return (
    <div {...rest} className={cn(cl.root, className)}>
      <Toolbar className={cl.start}>
        <Select
          options={selectOptions}
          value={
            levelset.currentIndex !== undefined
              ? selectOptions[levelset.currentIndex]
              : null
          }
          onChange={handleSelect}
          placeholder={`x ${levelsCount}`}
          className={cl.select2}
        />
      </Toolbar>

      <LevelsTabs className={cl.tabs} />

      <Toolbar className={cl.end}>
        <LevelsToolbar />
      </Toolbar>
    </div>
  );
};
