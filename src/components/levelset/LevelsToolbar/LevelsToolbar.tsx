import { useStore } from "effector-react";
import { FC, useMemo } from "react";
import {
  $currentBuffer,
  $currentLevel,
  $currentLevelset,
  appendLevel,
  closeLevel,
  deleteCurrentLevel,
  insertAtCurrentLevel,
} from "models/levelsets";
import { Button } from "ui/button";
import { ask } from "ui/feedback";
import { svgs } from "ui/icon";
import { ColorType } from "ui/types";
import { fmtLevelFull, fmtLevelNumber } from "../fmt";

const handleClose = () => closeLevel();

export const LevelsToolbar: FC = () => {
  const fileLevelset = useStore($currentLevelset)!;
  const levelset = useStore($currentBuffer)!;
  const level = useStore($currentLevel);

  const levelsCount = levelset.levels.length;
  const levelsCountDigits = String(levelsCount).length;

  const levelFullReference =
    level &&
    fmtLevelFull(
      level.index,
      levelsCountDigits,
      level.level.undoQueue.current.title,
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
    <>
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
    </>
  );
};
