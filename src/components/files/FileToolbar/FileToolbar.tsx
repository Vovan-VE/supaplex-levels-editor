import { useStore } from "effector-react";
import { FC, useMemo } from "react";
import {
  $currentFileName,
  downloadCurrentFile,
  removeCurrentLevelsetFile,
  renameCurrentLevelset,
} from "models/levelsets";
import { Button, Toolbar } from "ui/button";
import { ask, promptString } from "ui/feedback";
import { svgs } from "ui/icon";
import { ColorType, ContainerProps } from "ui/types";

const handleRename = async (filename: string) => {
  const newName = await promptString({
    title: (
      <>
        Rename file "<b>{filename}</b>" in memory
      </>
    ),
    label: "New filename",
    defaultValue: filename,
    required: true,
  });
  if (newName !== undefined) {
    renameCurrentLevelset(newName);
  }
};

const handleRemove = async (filename: string) => {
  if (
    await ask(
      <>
        Are you sure you want to remove file "<b>{filename}</b>" from memory?
        <br />
        You will loss all changes in the file. Consider download it first to
        backup.
        <br />
        <b>This action can not be undone.</b>
      </>,
      {
        buttons: {
          okText: <>Forgot "{filename}"</>,
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
    removeCurrentLevelsetFile();
  }
};

export const FileToolbar: FC<ContainerProps> = (props) => {
  const filename = useStore($currentFileName);

  const handleFile = useMemo(
    () =>
      filename
        ? {
            rename: () => handleRename(filename),
            remove: () => handleRemove(filename),
          }
        : undefined,
    [filename],
  );

  return (
    <Toolbar {...props}>
      <Button
        uiColor={ColorType.SUCCESS}
        icon={<svgs.Download />}
        disabled={!filename}
        title={filename ? `Save file "${filename}" from memory` : undefined}
        onClick={downloadCurrentFile}
      />
      <Button
        icon={<svgs.Rename />}
        disabled={!filename}
        title="Rename file"
        onClick={handleFile?.rename}
      />
      <Button
        uiColor={ColorType.DANGER}
        icon={<svgs.Trash />}
        disabled={!filename}
        title={
          filename ? `Remove levelset "${filename}" from memory` : undefined
        }
        onClick={handleFile?.remove}
      />
    </Toolbar>
  );
};
