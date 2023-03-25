import { useStore } from "effector-react";
import { useMemo } from "react";
import { SupportReportType } from "drivers";
import {
  $currentFileName,
  convertLevelsetTryFx,
  removeCurrentLevelsetFile,
  removeOthersLevelsetFile,
  renameCurrentLevelset,
} from "models/levelsets";
import { ask, msgBox, promptString } from "ui/feedback";
import { ColorType } from "ui/types";
import { promptFormat } from "./promptFormat";
import { SupportReport } from "./SupportReport";

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

const handleConvert = async () => {
  const toDriverFormat = await promptFormat();
  if (toDriverFormat) {
    const report = await convertLevelsetTryFx({ toDriverFormat });
    if (report) {
      if (report.type === SupportReportType.ERR) {
        return msgBox(<SupportReport report={report} />, {
          button: { uiColor: ColorType.MUTE, text: "Close" },
        });
      }
      if (
        await ask(<SupportReport report={report} />, {
          buttons: {
            okText: "Create",
            ok: {
              uiColor: ColorType.SUCCESS,
              autoFocus: false,
            },
            cancel: {
              autoFocus: true,
            },
          },
        })
      ) {
        return convertLevelsetTryFx({ toDriverFormat, confirmWarnings: true });
      }
    }
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
const handleRemoveOthers = async (filename: string) => {
  if (
    await ask(
      <>
        Are you sure you want to remove ALL OTHER FILES BUT "<b>{filename}</b>"
        from memory?
        <br />
        You will loss all changes in that files. Consider download them first to
        backup.
        <br />
        <b>This action can not be undone.</b>
      </>,
      {
        buttons: {
          okText: <>Forgot OTHER BUT "{filename}"</>,
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
    removeOthersLevelsetFile();
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
              convert: handleConvert,
              remove: () => handleRemove(filename),
              removeOthers: () => handleRemoveOthers(filename),
            }
          : undefined,
      [filename],
    ),
  };
};
