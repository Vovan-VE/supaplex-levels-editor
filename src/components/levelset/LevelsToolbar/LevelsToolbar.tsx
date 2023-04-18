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
  deleteRestLevels,
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

const confirmDeleteCurrent = (levelFullReference: string) =>
  ask(
    <>
      Are you sure you want to delete the level "
      <code>{levelFullReference}</code>" from this level set?
      <br />
      This will cause all the levels following to shift backward.
      <br />
      <b>This action can not be undone.</b>
    </>,
    {
      size: "small",
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
  );

const confirmDeleteRest = (currentIndex: number, count: number) => {
  const restCount = count - (currentIndex + 1);
  return ask(
    <>
      Are you sure you want to delete all the rest <strong>{restCount}</strong>{" "}
      levels <strong>after</strong> current one (that is starting from{" "}
      <code>{currentIndex + 2}</code> inclusive) from this levelset?
      <br />
      The levelset then will have only <strong>{currentIndex + 1}</strong>{" "}
      levels.
      <br />
      <b>This action can not be undone.</b>
    </>,
    {
      size: "small",
      buttons: {
        okText: (
          <>
            Delete <strong>{restCount}</strong> rest levels
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
  );
};

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
            if (await confirmDeleteCurrent(levelFullReference)) {
              deleteCurrentLevel();
            }
          }
        : undefined,
    [levelFullReference],
  );
  const handleDeleteRestClick = useMemo(
    () =>
      level
        ? async () => {
            if (await confirmDeleteRest(level!.index, levelsCount)) {
              deleteRestLevels();
            }
          }
        : undefined,
    [level, levelsCount],
  );

  const cannotAddLevel =
    maxLevelsCount !== null && levelsCount >= maxLevelsCount;

  const cannotRemoveLevel = levelsCount <= minLevelsCount;
  const cannotRemoveLevelMessage = cannotRemoveLevel
    ? `Cannot remove level because it's already minimum ${minLevelsCount}`
    : undefined;

  const cannotRemoveRestLevels =
    level !== null &&
    !(level.index + 1 < levelsCount && levelsCount > minLevelsCount);
  const deleteRestTitle = level
    ? `Delete rest ${levelsCount - (level.index + 1)} levels`
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

  const deleteButton = (
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
  );

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
      {cannotRemoveLevel ||
        (isCompact ? (
          <>
            {deleteButton}
            <Button
              uiColor={ColorType.DANGER}
              icon={<svgs.DeleteRest />}
              title={deleteRestTitle}
              disabled={cannotRemoveRestLevels}
              onClick={handleDeleteRestClick}
            />
          </>
        ) : (
          <ButtonDropdown
            standalone={deleteButton}
            buttonProps={{ uiColor: ColorType.DANGER }}
          >
            <Toolbar>
              <Button
                uiColor={ColorType.DANGER}
                icon={<svgs.DeleteRest />}
                disabled={cannotRemoveRestLevels}
                onClick={handleDeleteRestClick}
              >
                {deleteRestTitle}
              </Button>
            </Toolbar>
          </ButtonDropdown>
        ))}

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
