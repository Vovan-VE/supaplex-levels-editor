import { combine, createEffect, Effect } from "effector";
import { allowManualSave, exitApp, onExitDirty, setIsDirty } from "backend";
import { Trans } from "i18n/Trans";
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
  onceFlushDone,
  removeCurrentLevelsetFile,
  removeOthersLevelsetFile,
} from "./files";

export const closeCurrentFileFx: Effect<any, void> = allowManualSave
  ? createEffect(async () => {
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
          <Trans
            i18nKey="desktop:files.confirm.CloseFileSave"
            values={{ filename }}
          />,
          {
            buttons: YesNoCancel,
            buttonsProps: {
              yesText: <Trans i18nKey="desktop:files.confirm.Save" />,
              noText: <Trans i18nKey="desktop:files.confirm.DontSave" />,
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
  : createEffect(async () => {
      const filename = $currentFileName.getState();
      const values = { filename };
      if (
        await ask(
          <Trans i18nKey="web:files.closeFileSave.Confirm" values={values} />,
          {
            buttons: {
              okText: (
                <Trans i18nKey="web:files.closeFileSave.OK" values={values} />
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
        )
      ) {
        removeCurrentLevelsetFile();
      }
    });

export const closeOtherFilesFx: Effect<any, void> = allowManualSave
  ? createEffect(async () => {
      if (!$otherIsDirty.getState()) {
        removeOthersLevelsetFile();
        return;
      }
      if ($autoSave.getState()) {
        saveOthersAndClose();
        return;
      }
      switch (
        await ask(<Trans i18nKey="desktop:files.confirm.CloseOthersSave" />, {
          buttons: YesNoCancel,
          buttonsProps: {
            yesText: <Trans i18nKey="desktop:files.buttons.SaveAll" />,
            noText: <Trans i18nKey="desktop:files.buttons.DontSave" />,
            no: { uiColor: ColorType.DANGER },
          },
        })
      ) {
        case true:
          saveOthersAndClose();
          return;
        case false:
          removeOthersLevelsetFile();
          return;
      }
    })
  : createEffect(async () => {
      const filename = $currentFileName.getState();
      const values = { filename };
      if (
        await ask(
          <Trans i18nKey="web:files.closeOthersSave.Confirm" values={values} />,
          {
            buttons: {
              okText: (
                <Trans i18nKey="web:files.closeOthersSave.OK" values={values} />
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
    const message = <Trans i18nKey="desktop:files.confirm.ExitSave" />;

    onExitDirty.watch(
      exitApp
        ? async () => {
            switch (
              await ask(message, {
                buttons: YesNoCancel,
                buttonsProps: {
                  yesText: <Trans i18nKey="desktop:files.buttons.SaveAll" />,
                  yes: { uiColor: ColorType.SUCCESS },
                  noText: <Trans i18nKey="desktop:files.buttons.DontSave" />,
                  no: { uiColor: ColorType.DANGER },
                },
              })
            ) {
              case true:
                onceFlushDone(exitApp!);
                await saveAllFx();
                break;
              case false:
                exitApp!(true);
                break;
            }
          }
        : async () => {
            if (
              await ask(message, {
                buttons: {
                  okText: <Trans i18nKey="desktop:files.buttons.SaveAll" />,
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
