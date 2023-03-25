import { useStore } from "effector-react";
import { FC, useCallback, useMemo } from "react";
import { getDriverFormat } from "drivers";
import {
  $currentBuffer,
  $currentBufferHasOtherOpened,
  $currentDriverFormat,
  $currentDriverName,
  $currentLevel,
  appendLevel,
  closeCurrentLevel,
  closeOtherLevels,
  deleteCurrentLevel,
  insertAtCurrentLevel,
} from "models/levelsets";
import { Button, ButtonDropdown, Toolbar } from "ui/button";
import { ask } from "ui/feedback";
import { IconStack, IconStackType, svgs } from "ui/icon";
import { ColorType } from "ui/types";
import { fmtLevelFull, fmtLevelNumber } from "../fmt";

const closeOtherStack: IconStack = [[IconStackType.Index, <svgs.Cross />]];

interface Props {
  isCompact?: boolean;
}

export const LevelsToolbar: FC<Props> = ({ isCompact = false }) => {
  const format = getDriverFormat(
    useStore($currentDriverName)!,
    useStore($currentDriverFormat)!,
  );
  const { minLevelsCount = 1, maxLevelsCount = null } = format || {};
  const levelset = useStore($currentBuffer)!;
  const level = useStore($currentLevel);

  const levelsCount = levelset.levels.length;
  const levelsCountDigits = String(levelsCount).length;

  const hasOtherOpened = useStore($currentBufferHasOtherOpened);

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

  const cannotAddLevel =
    maxLevelsCount !== null && levelsCount >= maxLevelsCount;

  const cannotRemoveLevel = levelsCount <= minLevelsCount;
  const cannotRemoveLevelMessage = cannotRemoveLevel
    ? `Cannot remove level because it's already minimum ${minLevelsCount}`
    : undefined;

  const insertButton = cannotAddLevel ? undefined : (
    <Button
      icon={<svgs.InsertRow />}
      disabled={!level}
      title={
        level
          ? `Insert a new level at ${fmtLevelNumber(
              level.index,
              levelsCountDigits,
            )} and move the current forward`
          : ""
      }
      onClick={insertAtCurrentLevel}
    />
  );

  const appendTitle = `Append new level ${fmtLevelNumber(
    levelsCount,
    levelsCountDigits,
  )}`;

  const closeButton = (
    <Button
      icon={<svgs.Cross />}
      disabled={!level}
      onClick={closeCurrentLevel}
      title={
        levelFullReference ? `Close level tab (${levelFullReference})` : ""
      }
    />
  );
  const closeOthersTitle = "Close other levels tabs";
  const handleCloseOthers = useCallback(async () => {
    if (
      await ask(
        <>
          Are you sure you want to close ALL OTHER levels BUT "
          <b>{levelFullReference}</b>"?
        </>,
        {
          buttons: {
            okText: <>Close OTHER BUT "{levelFullReference}"</>,
            ok: {
              autoFocus: false,
            },
            cancel: {
              autoFocus: true,
            },
          },
        },
      )
    ) {
      closeOtherLevels();
    }
  }, [levelFullReference]);

  return (
    <>
      {cannotAddLevel ||
        (isCompact ? (
          <>
            {insertButton}
            <Button
              icon={<svgs.AppendRow />}
              title={appendTitle}
              onClick={appendLevel}
            />
          </>
        ) : (
          <ButtonDropdown standalone={insertButton}>
            <Toolbar>
              <Button icon={<svgs.AppendRow />} onClick={appendLevel}>
                {appendTitle}
              </Button>
            </Toolbar>
          </ButtonDropdown>
        ))}
      {cannotRemoveLevel || (
        <Button
          uiColor={ColorType.DANGER}
          icon={<svgs.DeleteRow />}
          disabled={!level}
          onClick={handleDeleteClick}
          title={
            cannotRemoveLevelMessage ||
            (levelFullReference ? `Delete level ${levelFullReference}` : "")
          }
        />
      )}

      {hasOtherOpened && !isCompact ? (
        <ButtonDropdown standalone={closeButton}>
          <Toolbar>
            <Button
              icon={<svgs.Cross />}
              iconStack={closeOtherStack}
              onClick={handleCloseOthers}
            >
              {closeOthersTitle}
            </Button>
          </Toolbar>
        </ButtonDropdown>
      ) : (
        <>
          {closeButton}
          {hasOtherOpened && (
            <Button
              icon={<svgs.Cross />}
              iconStack={closeOtherStack}
              onClick={handleCloseOthers}
              title={closeOthersTitle}
            />
          )}
        </>
      )}
    </>
  );
};
