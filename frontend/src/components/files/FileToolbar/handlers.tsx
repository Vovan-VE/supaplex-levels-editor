import { allowManualSave } from "backend";
import { SupportReportType } from "drivers";
import {
  $currentFileName,
  convertLevelsetTryFx,
  renameCurrentLevelset,
} from "models/levelsets";
import { ask, msgBox, promptString } from "ui/feedback";
import { ColorType } from "ui/types";
import { promptFormat } from "./promptFormat";
import { SupportReport } from "./SupportReport";

export const handleRename = allowManualSave
  ? undefined
  : async () => {
      const filename = $currentFileName.getState();
      if (filename) {
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
      }
    };

export const handleConvert = async () => {
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
