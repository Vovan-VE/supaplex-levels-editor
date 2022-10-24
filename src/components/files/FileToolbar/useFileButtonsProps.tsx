import { useStore } from "effector-react";
import { useMemo } from "react";
import {
  $currentFileName,
  removeCurrentLevelsetFile,
  renameCurrentLevelset,
} from "models/levelsets";
import { ask, promptString } from "ui/feedback";
import { ColorType } from "ui/types";

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

export const useFileButtonsProps = () => {
  const filename = useStore($currentFileName);

  return {
    filename,
    handlers: useMemo(
      () =>
        filename
          ? {
              rename: () => handleRename(filename),
              remove: () => handleRemove(filename),
            }
          : undefined,
      [filename],
    ),
  };
};
