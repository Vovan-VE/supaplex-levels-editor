import { useStore } from "effector-react";
import { FC, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { allowManualSave } from "backend";
import {
  $currentFileHasLocalOptions,
  $currentFileIsDirty,
  $hasOtherFiles,
  $isFileOpened,
  closeCurrentFileFx,
  closeOtherFilesFx,
  flushCurrentFile,
  saveAsCurrentFile,
} from "models/levelsets";
import { Button, ButtonDropdown, Toolbar } from "ui/button";
import { ColorType } from "ui/types";
import { IconStack, IconStackType, svgs } from "ui/icon";
import { handleConvert, handleRename } from "./handlers";

const removeColor = allowManualSave ? ColorType.DEFAULT : ColorType.DANGER;
const removeIcon = allowManualSave ? <svgs.Cross /> : <svgs.Trash />;
const removeOtherStack: IconStack = [[IconStackType.Index, removeIcon]];

interface Props {
  isCompact?: boolean;
}

const SaveFlushButton: FC = () => {
  const { t } = useTranslation();
  const isDirty = useStore($currentFileIsDirty);
  return (
    <Button
      uiColor={ColorType.SUCCESS}
      icon={<svgs.Save />}
      disabled={!isDirty}
      title={t("desktop:files.buttons.Save")}
      onClick={flushCurrentFile}
    />
  );
};

export const FileToolbar: FC<Props> = ({ isCompact = false }) => {
  const { t } = useTranslation();
  const hasLocalOptions = useStore($currentFileHasLocalOptions);
  const hasOtherFiles = useStore($hasOtherFiles);
  const isFileOpened = useStore($isFileOpened);

  const saveAsButton = (
    <Button
      uiColor={ColorType.SUCCESS}
      icon={<svgs.Save />}
      disabled={!isFileOpened}
      title={
        isFileOpened
          ? allowManualSave
            ? t("desktop:files.buttons.SaveAs")
            : t("web:files.buttons.Save")
          : undefined
      }
      onClick={useCallback(() => saveAsCurrentFile(), [])}
    />
  );
  const saveWithOptionsTitle = isFileOpened
    ? t("main:files.buttons.SaveZipWithOptions")
    : undefined;
  const handleSaveWithOptions = useCallback(
    () => saveAsCurrentFile({ withLocalOptions: true }),
    [],
  );

  const removeButton = (
    <Button
      uiColor={removeColor}
      icon={removeIcon}
      disabled={!isFileOpened}
      title={
        isFileOpened
          ? allowManualSave
            ? t("desktop:files.buttons.Close")
            : t("web:files.buttons.Remove")
          : undefined
      }
      onClick={closeCurrentFileFx}
    />
  );
  const removeOthersTitle = allowManualSave
    ? t("desktop:files.buttons.CloseOthers")
    : t("web:files.buttons.RemoveOthers");

  return (
    <>
      {allowManualSave && <SaveFlushButton />}
      {hasLocalOptions && !isCompact && isFileOpened ? (
        <ButtonDropdown
          standalone={saveAsButton}
          buttonProps={{ uiColor: ColorType.SUCCESS }}
        >
          <Toolbar>
            <Button
              uiColor={ColorType.SUCCESS}
              icon={<svgs.Save />}
              onClick={handleSaveWithOptions}
            >
              {saveWithOptionsTitle}
            </Button>
          </Toolbar>
        </ButtonDropdown>
      ) : (
        <>
          {saveAsButton}
          {hasLocalOptions && (
            <Button
              uiColor={ColorType.SUCCESS}
              icon={<svgs.Save />}
              disabled={!isFileOpened}
              title={saveWithOptionsTitle}
              onClick={handleSaveWithOptions}
            />
          )}
        </>
      )}

      <Button
        uiColor={ColorType.SUCCESS}
        icon={<svgs.FileConvert />}
        disabled={!isFileOpened}
        title={t("main:files.buttons.ConvertFormat")}
        onClick={handleConvert}
      />
      {handleRename && (
        <Button
          icon={<svgs.Rename />}
          disabled={!isFileOpened}
          title={t("web:files.buttons.Rename")}
          onClick={handleRename}
        />
      )}

      {hasOtherFiles && !isCompact ? (
        <ButtonDropdown
          standalone={removeButton}
          buttonProps={{ uiColor: removeColor }}
        >
          <Toolbar>
            <Button
              uiColor={removeColor}
              icon={removeIcon}
              iconStack={removeOtherStack}
              onClick={closeOtherFilesFx}
            >
              {removeOthersTitle}
            </Button>
          </Toolbar>
        </ButtonDropdown>
      ) : (
        <>
          {removeButton}
          {hasOtherFiles && (
            <Button
              uiColor={removeColor}
              icon={removeIcon}
              iconStack={removeOtherStack}
              title={removeOthersTitle}
              onClick={closeOtherFilesFx}
            />
          )}
        </>
      )}
    </>
  );
};
