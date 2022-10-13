import { FC, useCallback, useMemo } from "react";
import cn from "classnames";
import { useStore } from "effector-react";
import {
  $currentBuffer,
  $currentLevel,
  $currentLevelset,
  $currentOpenedIndices,
  appendLevel,
  closeLevel,
  deleteCurrentLevel,
  insertAtCurrentLevel,
  setCurrentLevel,
} from "models/levelsets";
import { Button, TabItem, TabsButtons, Toolbar } from "ui/button";
import { svgs } from "ui/icon";
import { Select, SelectOption } from "ui/input";
import { ask } from "ui/feedback";
import { ColorType, ContainerProps } from "ui/types";
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
  const fileLevelset = useStore($currentLevelset)!;
  const levelset = useStore($currentBuffer)!;
  const level = useStore($currentLevel);
  const openedIndices = useStore($currentOpenedIndices);

  const levelsCount = levelset.levels.length;
  const levelsCountDigits = String(levelsCount).length;

  const levelFullReference =
    level &&
    fmtLevelFull(
      level.index,
      levelsCountDigits,
      level.level.undoQueue.current.title,
    );

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

  const handleDeleteClick = useMemo(
    () =>
      levelFullReference
        ? async () => {
            if (
              await ask(
                <>
                  Are you sure you want to delete the level "
                  <code>{levelFullReference}</code>" from this level set?
                  <br />
                  This will cause all the levels following to shift backward.
                  <br />
                  <b>This action can not be undone.</b>
                </>,
                {
                  buttons: {
                    okText: (
                      <>
                        Delete <code>"{levelFullReference}"</code>
                      </>
                    ),
                    ok: {
                      uiColor: ColorType.DANGER,
                      autoFocus: false,
                    },
                    cancel: {
                      autoFocus: true,
                    },
                  },
                },
              )
            ) {
              deleteCurrentLevel();
            }
          }
        : undefined,
    [levelFullReference],
  );

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

  if (!levelset) {
    throw new Error("Logic error");
  }

  const cannotAddLevelMessage =
    fileLevelset.maxLevelsCount !== null &&
    levelsCount >= fileLevelset.maxLevelsCount
      ? `Cannot add more level than ${fileLevelset.maxLevelsCount}`
      : undefined;
  const cannotRemoveLevelMessage =
    levelsCount <= fileLevelset.minLevelsCount
      ? `Cannot remove level because it's already minimum ${fileLevelset.minLevelsCount}`
      : undefined;

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

      <TabsButtons
        tabs={tabs}
        current={levelset.currentIndex}
        onClick={setCurrentLevel}
        className={cl.tabs}
      />

      <Toolbar className={cl.end}>
        <Button
          icon={<svgs.InsertRow />}
          disabled={!level || Boolean(cannotAddLevelMessage)}
          title={
            level
              ? cannotAddLevelMessage ||
                `Insert a new level at ${fmtLevelNumber(
                  level.index,
                  levelsCountDigits,
                )} and move the current forward`
              : ""
          }
          onClick={insertAtCurrentLevel}
        />
        <Button
          icon={<svgs.AppendRow />}
          disabled={Boolean(cannotAddLevelMessage)}
          title={
            cannotAddLevelMessage ||
            `Append new level ${fmtLevelNumber(levelsCount, levelsCountDigits)}`
          }
          onClick={appendLevel}
        />
        <Button
          uiColor={ColorType.DANGER}
          icon={<svgs.DeleteRow />}
          disabled={!level || Boolean(cannotRemoveLevelMessage)}
          onClick={handleDeleteClick}
          title={
            cannotRemoveLevelMessage ||
            (levelFullReference ? `Delete level ${levelFullReference}` : "")
          }
        />
        <Button
          icon={<svgs.Cross />}
          disabled={!level}
          onClick={handleClose}
          title={
            levelFullReference ? `Close level tab (${levelFullReference})` : ""
          }
        />
      </Toolbar>
    </div>
  );
};
