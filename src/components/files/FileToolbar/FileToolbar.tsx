import { useStore } from "effector-react";
import { FC } from "react";
import { $hasOtherFiles, downloadCurrentFile } from "models/levelsets";
import { Button, ButtonDropdown, Toolbar } from "ui/button";
import { ColorType } from "ui/types";
import { IconStack, IconStackType, svgs } from "ui/icon";
import { useFileButtonsProps } from "./useFileButtonsProps";

const removeOtherStack: IconStack = [[IconStackType.Index, <svgs.Trash />]];

interface Props {
  isCompact?: boolean;
}

export const FileToolbar: FC<Props> = ({ isCompact = false }) => {
  const hasOtherFiles = useStore($hasOtherFiles);
  const { filename, handlers } = useFileButtonsProps();

  const removeButton = (
    <Button
      uiColor={ColorType.DANGER}
      icon={<svgs.Trash />}
      disabled={!filename}
      title={filename ? `Remove levelset "${filename}" from memory` : undefined}
      onClick={handlers?.remove}
    />
  );

  const removeOthersTitle = `Remove others but "${filename}"`;
  return (
    <>
      <Button
        uiColor={ColorType.SUCCESS}
        icon={<svgs.Save />}
        disabled={!filename}
        title={filename ? `Save file "${filename}" from memory` : undefined}
        onClick={downloadCurrentFile}
      />
      <Button
        uiColor={ColorType.SUCCESS}
        icon={<svgs.FileConvert />}
        disabled={!filename}
        title="Convert format..."
        onClick={handlers?.convert}
      />
      <Button
        icon={<svgs.Rename />}
        disabled={!filename}
        title="Rename file"
        onClick={handlers?.rename}
      />

      {hasOtherFiles && !isCompact ? (
        <ButtonDropdown
          standalone={removeButton}
          buttonProps={{ uiColor: ColorType.DANGER }}
        >
          <Toolbar>
            <Button
              uiColor={ColorType.DANGER}
              icon={<svgs.Trash />}
              iconStack={removeOtherStack}
              onClick={handlers?.removeOthers}
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
              uiColor={ColorType.DANGER}
              icon={<svgs.Trash />}
              iconStack={removeOtherStack}
              title={removeOthersTitle}
              onClick={handlers?.removeOthers}
            />
          )}
        </>
      )}
    </>
  );
};
