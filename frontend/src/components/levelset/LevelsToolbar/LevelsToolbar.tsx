import { useUnit } from "effector-react";
import { FC, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { openFile } from "backend";
import { getDriverFormat, levelSupportsDemo } from "drivers";
import { Trans } from "i18n/Trans";
import {
  exportAsImageToClipboard,
  exportAsImageToFile,
} from "models/levels/export-img";
import {
  copyLevelAsDemoLink,
  copyLevelAsTestLink,
} from "models/levels/export-url";
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
  exportCurrentLevel,
  importCurrentLevel,
  insertAtCurrentLevel,
} from "models/levelsets";
import { Button, ButtonDropdown, TextButton, Toolbar } from "ui/button";
import { ask } from "ui/feedback";
import { IconStack, IconStackType, svgs } from "ui/icon";
import { ColorType } from "ui/types";
import { fmtLevelFull, fmtLevelNumber } from "../fmt";

const closeOtherStack: IconStack = [[IconStackType.Index, <svgs.Cross />]];

interface Props {
  isCompact?: boolean;
}

const confirmDeleteCurrent = (levelFullReference: string) => {
  const values = { level: levelFullReference };
  return ask(
    <Trans i18nKey="main:levels.deleteCurrent.Confirm" values={values} />,
    {
      size: "small",
      buttons: {
        okText: (
          <Trans i18nKey="main:levels.deleteCurrent.Button" values={values} />
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

const confirmDeleteRest = (currentIndex: number, count: number) => {
  const restCount = count - (currentIndex + 1);
  const values = {
    restCount,
    nextIndex: currentIndex + 2,
    leftCount: currentIndex + 1,
  };
  return ask(
    <Trans i18nKey="main:levels.deleteRest.Confirm" values={values} />,
    {
      size: "small",
      buttons: {
        okText: (
          <Trans i18nKey="main:levels.deleteRest.Button" values={values} />
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

const handleImportLevelClick = () =>
  openFile({ done: (items) => importCurrentLevel(items[0].file) });

export const LevelsToolbar: FC<Props> = ({ isCompact = false }) => {
  const { t } = useTranslation();
  const format = getDriverFormat(
    useUnit($currentDriverName)!,
    useUnit($currentDriverFormat)!,
  );
  const {
    minLevelsCount = 1,
    maxLevelsCount = null,
    demoSupport = false,
  } = format || {};
  const levelset = useUnit($currentBuffer)!;
  const level = useUnit($currentLevel);
  const hasDemo = Boolean(
    level &&
      ((lvl = level.level.undoQueue.current) =>
        levelSupportsDemo(lvl) && lvl.demo != null)(),
  );

  const levelsCount = levelset.levels.length;
  const levelsCountDigits = String(levelsCount).length;

  const hasOtherOpened = useUnit($currentBufferHasOtherOpened);

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
    ? t("main:level.manage.CannotLessThenMin", { min: minLevelsCount })
    : undefined;

  const cannotRemoveRestLevels = !(
    level === null ||
    (level.index + 1 < levelsCount && levelsCount > minLevelsCount)
  );
  const deleteRestTitle = level
    ? t("main:level.manage.DeleteRestLevels", {
        n: levelsCount - (level.index + 1),
      })
    : undefined;

  const insertButton = cannotAddLevel ? undefined : (
    <Button
      icon={<svgs.InsertRow />}
      disabled={!level}
      title={
        level
          ? t("main:level.manage.Insert", {
              number: fmtLevelNumber(level.index, levelsCountDigits),
            })
          : ""
      }
      onClick={insertAtCurrentLevel}
    />
  );

  const appendTitle = t("main:level.manage.Append", {
    number: fmtLevelNumber(levelsCount, levelsCountDigits),
  });

  const closeButton = (
    <Button
      icon={<svgs.Cross />}
      disabled={!level}
      onClick={closeCurrentLevel}
      title={
        levelFullReference
          ? t("main:level.manage.CloseTab", { level: levelFullReference })
          : ""
      }
    />
  );
  const closeOthersTitle = t("main:level.manage.CloseOtherTabs");
  const handleCloseOthers = useCallback(async () => {
    const values = { level: levelFullReference };
    if (
      await ask(
        <Trans i18nKey="main:levels.closeOther.Confirm" values={values} />,
        {
          buttons: {
            okText: (
              <Trans i18nKey="main:levels.closeOther.Button" values={values} />
            ),
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
        (levelFullReference
          ? t("main:level.manage.Delete", { level: levelFullReference })
          : "")
      }
    />
  );

  return (
    <>
      <ButtonDropdown
        triggerIcon={<svgs.Save />}
        buttonProps={{
          iconStack: [[IconStackType.Index, <svgs.FileBlank />]],
          title: t("main:level.manage.ExportLevel"),
          disabled: !level,
        }}
      >
        <Toolbar isMenu>
          <TextButton onClick={exportCurrentLevel} uiColor={ColorType.DEFAULT}>
            {t("main:level.export.SaveLevelAsFile")}
          </TextButton>
          <TextButton onClick={exportAsImageToFile} uiColor={ColorType.DEFAULT}>
            {t("main:level.export.SaveSelectionAsImage")}
          </TextButton>
          <TextButton
            icon={<svgs.Copy />}
            uiColor={ColorType.DEFAULT}
            onClick={exportAsImageToClipboard}
          >
            {t("main:level.export.CopySelectionAsImage")}
          </TextButton>
          <TextButton
            icon={<svgs.Copy />}
            uiColor={ColorType.DEFAULT}
            onClick={copyLevelAsTestLink}
          >
            {t("main:level.export.CopyLevelAsTestUrl")}
          </TextButton>
          {demoSupport && (
            <TextButton
              icon={<svgs.Copy />}
              uiColor={ColorType.DEFAULT}
              onClick={copyLevelAsDemoLink}
              disabled={!hasDemo}
            >
              {hasDemo
                ? t("main:level.export.CopyLevelAsDemoLink")
                : t("main:level.export.CopyLevelAsDemoLinkNone")}
            </TextButton>
          )}
        </Toolbar>
      </ButtonDropdown>
      <Button
        icon={<svgs.DirOpen />}
        iconStack={[[IconStackType.Index, <svgs.FileBlank />]]}
        title={t("main:level.manage.ImportLevelFromFileReplace")}
        onClick={handleImportLevelClick}
        disabled={!level}
      />
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
