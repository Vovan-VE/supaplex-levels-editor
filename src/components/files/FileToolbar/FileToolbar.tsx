import { FC } from "react";
import { downloadCurrentFile } from "models/levelsets";
import { Button } from "ui/button";
import { ColorType } from "ui/types";
import { svgs } from "ui/icon";
import { useFileButtonsProps } from "./useFileButtonsProps";

export const FileToolbar: FC = () => {
  const { filename, handlers } = useFileButtonsProps();

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
      <Button
        uiColor={ColorType.DANGER}
        icon={<svgs.Trash />}
        disabled={!filename}
        title={
          filename ? `Remove levelset "${filename}" from memory` : undefined
        }
        onClick={handlers?.remove}
      />
    </>
  );
};
