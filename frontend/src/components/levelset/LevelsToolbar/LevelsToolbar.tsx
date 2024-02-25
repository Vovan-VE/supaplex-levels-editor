import { useUnit } from "effector-react";
import { FC, Fragment, ReactElement, useCallback, useMemo } from "react";
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
  $currentFileRo,
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
  const isRo = useUnit($currentFileRo);
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

  let copyAsDemoButton: ReactElement | undefined;
  if (demoSupport) {
    const copyLevelAsDemoUrlTitle = hasDemo
      ? t("main:level.export.CopyLevelAsDemoLink")
      : t("main:level.export.CopyLevelAsDemoLinkNone");
    copyAsDemoButton = (
      <TextButton
        icon={<svgs.LinkDemo />}
        uiColor={ColorType.DEFAULT}
        onClick={copyLevelAsDemoLink}
        disabled={!hasDemo}
        title={isCompact ? copyLevelAsDemoUrlTitle : undefined}
      >
        {isCompact ? undefined : copyLevelAsDemoUrlTitle}
      </TextButton>
    );
  }
  const exportLevelAsFileTitle = t("main:level.export.SaveLevelAsFile");
  const exportSelectionAsImageTitle = t(
    "main:level.export.SaveSelectionAsImage",
  );
  const copySelectionAsImageTitle = t("main:level.export.CopySelectionAsImage");
  const copyLevelAsTestUrlTitle = t("main:level.export.CopyLevelAsTestUrl");
  const exportButtons = (
    <>
      <TextButton
        icon={<svgs.SaveLevelAsFile />}
        onClick={exportCurrentLevel}
        uiColor={ColorType.DEFAULT}
        title={isCompact ? exportLevelAsFileTitle : undefined}
      >
        {isCompact ? undefined : exportLevelAsFileTitle}
      </TextButton>
      <TextButton
        icon={<svgs.SaveAsImage />}
        onClick={exportAsImageToFile}
        uiColor={ColorType.DEFAULT}
        title={isCompact ? exportSelectionAsImageTitle : undefined}
      >
        {isCompact ? undefined : exportSelectionAsImageTitle}
      </TextButton>
      <wbr />
      <TextButton
        icon={<svgs.CopyImage />}
        uiColor={ColorType.DEFAULT}
        onClick={exportAsImageToClipboard}
        title={isCompact ? copySelectionAsImageTitle : undefined}
      >
        {isCompact ? undefined : copySelectionAsImageTitle}
      </TextButton>
      <TextButton
        icon={<svgs.LinkTest />}
        uiColor={ColorType.DEFAULT}
        onClick={copyLevelAsTestLink}
        title={isCompact ? copyLevelAsTestUrlTitle : undefined}
      >
        {isCompact ? undefined : copyLevelAsTestUrlTitle}
      </TextButton>
      {copyAsDemoButton}
    </>
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
    isRo || (maxLevelsCount !== null && levelsCount >= maxLevelsCount);

  const cannotRemoveLevel = isRo || levelsCount <= minLevelsCount;

  const addRemoveButtons: ReactElement[] = [];
  if (!cannotAddLevel) {
    const appendTitle = t("main:level.manage.Append", {
      number: fmtLevelNumber(levelsCount, levelsCountDigits),
    });

    addRemoveButtons.push(
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
      />,
      <Button
        icon={<svgs.AppendRow />}
        onClick={appendLevel}
        title={isCompact ? appendTitle : undefined}
      >
        {isCompact ? undefined : appendTitle}
      </Button>,
    );
  }
  if (!cannotRemoveLevel) {
    const deleteTitle = levelFullReference
      ? t("main:level.manage.Delete", { level: levelFullReference })
      : "";
    const deleteRestTitle = level
      ? t("main:level.manage.DeleteRestLevels", {
          n: levelsCount - (level.index + 1),
        })
      : undefined;

    addRemoveButtons.push(
      <Button
        uiColor={ColorType.DANGER}
        icon={<svgs.DeleteRow />}
        disabled={!level}
        onClick={handleDeleteClick}
        title={isCompact ? deleteTitle : undefined}
      >
        {isCompact ? undefined : deleteTitle}
      </Button>,
      <Button
        uiColor={ColorType.DANGER}
        icon={<svgs.DeleteRest />}
        title={isCompact ? deleteRestTitle : undefined}
        disabled={
          level !== null &&
          (level.index >= levelsCount - 1 || levelsCount <= minLevelsCount)
        }
        onClick={handleDeleteRestClick}
      >
        {isCompact ? undefined : deleteRestTitle}
      </Button>,
    );
  }

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

  return (
    <>
      {isCompact ? (
        <>
          {exportButtons}
          <wbr />
        </>
      ) : (
        <ButtonDropdown
          triggerIcon={<svgs.Save />}
          buttonProps={{
            iconStack: [[IconStackType.Index, <svgs.FileBlank />]],
            title: t("main:level.manage.ExportLevel"),
            disabled: !level,
          }}
        >
          <Toolbar isMenu>{exportButtons}</Toolbar>
        </ButtonDropdown>
      )}
      {isRo || (
        <Button
          icon={<svgs.DirOpen />}
          iconStack={[[IconStackType.Index, <svgs.FileBlank />]]}
          title={t("main:level.manage.ImportLevelFromFileReplace")}
          onClick={handleImportLevelClick}
          disabled={!level}
        />
      )}

      {isCompact ? (
        addRemoveButtons.map((b, i) => (
          <Fragment key={i}>
            {b}
            <wbr />
          </Fragment>
        ))
      ) : addRemoveButtons.length > 1 ? (
        <ButtonDropdown standalone={addRemoveButtons[0]}>
          <Toolbar isMenu>
            {addRemoveButtons.slice(1).map((b, i) => (
              <Fragment key={i}>{b}</Fragment>
            ))}
          </Toolbar>
        </ButtonDropdown>
      ) : (
        addRemoveButtons[0]
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
