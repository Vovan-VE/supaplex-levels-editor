import { combine, createEffect } from "effector";
import { useStore } from "effector-react";
import { useEffect } from "react";
import { allowManualSave } from "backend";
import { ask, YesNoCancel } from "ui/feedback";
import { ColorType } from "ui/types";
import { $autoSave } from "../settings";
import {
  $currentFileIsDirty,
  $isAnyDirty,
  $otherIsDirty,
  saveAll,
  saveAndClose,
  saveOthersAndClose,
} from "./buffers";
import {
  $currentFileName,
  removeCurrentLevelsetFile,
  removeOthersLevelsetFile,
} from "./files";

export const closeCurrentFileFx = createEffect(async (_: any) => {
  if (allowManualSave) {
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
  } else {
    const filename = $currentFileName.getState();
    if (
      await ask(
        <>
          Are you sure you want to remove ALL OTHER FILES BUT "<b>{filename}</b>
          " from memory?
          <br />
          You will loss all changes in that files. Consider download them first
          to backup.
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
  }
});

export const closeOtherFilesFx = createEffect(async (_: any) => {
  if (allowManualSave) {
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
  } else {
    const filename = $currentFileName.getState();
    if (
      await ask(
        <>
          Are you sure you want to remove ALL OTHER FILES BUT "<b>{filename}</b>
          " from memory?
          <br />
          You will loss all changes in that files. Consider download them first
          to backup.
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
  }
});

export const useBeforeUnloadHandling = allowManualSave
  ? (() => {
      async function displayConfirm() {
        if (
          await ask(
            "There are some changes in files. Save all changed files?",
            {
              buttons: {
                okText: "Save All",
                ok: {
                  uiColor: ColorType.SUCCESS,
                  autoFocus: true,
                },
              },
            },
          )
        ) {
          saveAll();
        }
      }
      function handleUnload(e: BeforeUnloadEvent) {
        if (!$isAnyDirty.getState()) {
          return;
        }
        if ($autoSave.getState()) {
          saveAll();
          return;
        }
        e.preventDefault();
        displayConfirm();
      }

      const $enable = combine($isAnyDirty, $autoSave, (d, a) => d && !a);
      return () => {
        const on = useStore($enable);
        useEffect(() => {
          if (on) {
            window.addEventListener("beforeunload", handleUnload);
            return () => {
              window.removeEventListener("beforeunload", handleUnload);
            };
          }
        }, [on]);
      };
    })()
  : () => {};
