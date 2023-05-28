import { combine, createEffect } from "effector";
import { allowManualSave, exitApp, onExitDirty, setIsDirty } from "backend";
import { ask, YesNoCancel } from "ui/feedback";
import { ColorType } from "ui/types";
import { $autoSave } from "../settings";
import {
  $currentFileIsDirty,
  $isAnyDirty,
  $otherIsDirty,
  saveAllFx,
  saveAndClose,
  saveOthersAndClose,
} from "./buffers";
import {
  $currentFileName,
  removeCurrentLevelsetFile,
  removeOthersLevelsetFile,
} from "./files";

export const closeCurrentFileFx = allowManualSave
  ? createEffect(async (_: any) => {
      if (!$currentFileIsDirty.getState()) {
        removeCurrentLevelsetFile();
        return;
      }
      if ($autoSave.getState()) {
        saveAndClose();
        return;
      }
      const filename = $currentFileName.getState();
      switch (
        await ask(
          <>
            File <b>{filename}</b> has some changes. Save changes?
          </>,
          {
            buttons: YesNoCancel,
            buttonsProps: {
              yesText: "Save",
              noText: "Don't save",
              no: { uiColor: ColorType.DANGER },
            },
          },
        )
      ) {
        case true:
          saveAndClose();
          return;
        case false:
          removeCurrentLevelsetFile();
          return;
      }
    })
  : createEffect(async (_: any) => {
      const filename = $currentFileName.getState();
      if (
        await ask(
          <>
            Are you sure you want to remove ALL OTHER FILES BUT "
            <b>{filename}</b>
            " from memory?
            <br />
            You will loss all changes in that files. Consider download them
            first to backup.
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
        removeCurrentLevelsetFile();
      }
    });

export const closeOtherFilesFx = allowManualSave
  ? createEffect(async (_: any) => {
      if (!$otherIsDirty.getState()) {
        removeOthersLevelsetFile();
        return;
      }
      if ($autoSave.getState()) {
        saveOthersAndClose();
        return;
      }
      switch (
        await ask(
          "There are some changes in files to be closed. Save all closing files?",
          {
            buttons: YesNoCancel,
            buttonsProps: {
              yesText: "Save All",
              noText: "Don't save",
              no: { uiColor: ColorType.DANGER },
            },
          },
        )
      ) {
        case true:
          saveOthersAndClose();
          return;
        case false:
          removeOthersLevelsetFile();
          return;
      }
    })
  : createEffect(async (_: any) => {
      const filename = $currentFileName.getState();
      if (
        await ask(
          <>
            Are you sure you want to remove ALL OTHER FILES BUT "
            <b>{filename}</b>
            " from memory?
            <br />
            You will loss all changes in that files. Consider download them
            first to backup.
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
    });

if (allowManualSave) {
  if (setIsDirty) {
    combine($isAnyDirty, $autoSave, (d, a) => d && !a).updates.watch(
      setIsDirty,
    );
  }
  if (onExitDirty) {
    const message = "There are some changes in files. Save all changed files?";

    onExitDirty.watch(
      exitApp
        ? async () => {
            switch (
              await ask(message, {
                buttons: YesNoCancel,
                buttonsProps: {
                  yesText: "Save All",
                  yes: { uiColor: ColorType.SUCCESS },
                  noText: "Don't save",
                  no: { uiColor: ColorType.DANGER },
                },
              })
            ) {
              case true:
                await saveAllFx();
                exitApp!();
                break;
              case false:
                exitApp!();
                break;
            }
          }
        : async () => {
            if (
              await ask(message, {
                buttons: {
                  okText: "Save All",
                  ok: { uiColor: ColorType.SUCCESS },
                },
              })
            ) {
              await saveAllFx();
            }
          },
    );
  }
}
