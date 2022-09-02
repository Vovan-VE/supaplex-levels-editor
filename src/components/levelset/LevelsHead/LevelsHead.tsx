import { ChangeEvent, FC, useCallback, useMemo } from "react";
import cn from "classnames";
import { useStore } from "effector-react";
import {
  $currentBuffer,
  $currentLevel,
  $currentOpenedIndices,
  closeLevel,
  setCurrentLevel,
} from "models/levelsets";
import { TabItem, TabsButtons, TextButton, Toolbar } from "ui/button";
import { svgs } from "ui/icon";
import { ContainerProps } from "ui/types";
import cl from "./LevelsHead.module.scss";

const handleClose = () => closeLevel();

const fmtLevelNumber = (index: number, maxDigits: number) =>
  String(index + 1).padStart(maxDigits, "0");

const fmtLevelTitle = (title: string) =>
  title.replace(/^[-\s=[\](){}<>~]+|[-\s=[\](){}<>~]+$/g, "");

const fmtLevelShort = (index: number, maxDigits: number, title: string) =>
  `${fmtLevelNumber(index, maxDigits)}: ${fmtLevelTitle(title)}`;

const fmtLevelFull = (index: number, maxDigits: number, title: string) =>
  `${fmtLevelNumber(index, maxDigits)}: ${title}`;

interface Props extends ContainerProps {}

export const LevelsHead: FC<Props> = ({ className, ...rest }) => {
  const levelset = useStore($currentBuffer)!;
  const level = useStore($currentLevel);
  const openedIndices = useStore($currentOpenedIndices);

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

  const handleSelChange = useCallback(
    ({ target }: ChangeEvent<HTMLSelectElement>) =>
      setCurrentLevel(Number(target.value)),
    [],
  );

  if (!levelset) {
    throw new Error("Logic error");
  }

  return (
    <div {...rest} className={cn(cl.root, className)}>
      <Toolbar className={cl.start}>
        <select value="" onChange={handleSelChange} className={cl.selSelect}>
          <option value="" disabled>{`x ${levelsCount}`}</option>
          {levelset.levels.map(({ undoQueue }, i) => (
            <option key={i} value={i}>
              {fmtLevelFull(i, levelsCountDigits, undoQueue.current.title)}
            </option>
          ))}
        </select>
      </Toolbar>

      <TabsButtons
        tabs={tabs}
        current={levelset.currentIndex}
        onClick={setCurrentLevel}
        className={cl.tabs}
      />

      <Toolbar className={cl.end}>
        <TextButton
          icon={<svgs.Cross />}
          disabled={!level}
          onClick={handleClose}
          title={`Close level tab${
            level
              ? ` (${fmtLevelShort(
                  level.index,
                  levelsCountDigits,
                  level.level.undoQueue.current.title,
                )})`
              : ""
          }`}
        />
      </Toolbar>
    </div>
  );
};
