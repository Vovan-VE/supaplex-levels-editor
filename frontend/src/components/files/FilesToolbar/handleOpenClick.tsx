import { createStore } from "effector";
import { ReactNode } from "react";
import { onOpenFile, openFile, OpenFileItem } from "backend";
import { detectDriverFormat } from "drivers";
import { Trans } from "i18n/Trans";
import { addLevelsetFileFx, filesDidWakeUp } from "models/levelsets";
import { msgBox } from "ui/feedback";

const openFiles = async (items: readonly OpenFileItem[]) => {
  const detected = await Promise.allSettled(
    items.map(
      async (item) =>
        [
          item,
          detectDriverFormat(await item.file.arrayBuffer(), item.file.name),
        ] as const,
    ),
  );
  const errors: ReactNode[] = [];
  for (const [i, item] of detected.entries()) {
    if (item.status !== "fulfilled") {
      //console.warn("openFiles failed", item, item.reason);
      errors.push(
        <Trans
          i18nKey="main:files.messages.CannotReadFile"
          values={{
            file: items[i].file.name,
            reason:
              item.reason instanceof Error
                ? item.reason.message
                : "unknown reason",
          }}
        />,
      );
      // showToastErrorWrap("Cannot read file", item.reason);
      continue;
    }
    const [{ file, key }, d] = item.value;
    if (!d) {
      errors.push(
        <Trans
          i18nKey="main:files.messages.UnsupportedFormat"
          values={{ file: file.name }}
        />,
      );
      continue;
    }
    const [driverName, driverFormat] = d;
    await addLevelsetFileFx({
      file,
      driverName,
      driverFormat,
      name: file.name,
      key,
    }).catch(() => {});
  }
  if (errors.length) {
    // TODO: typography component to add intro text with apply uiColor
    msgBox(
      <ul>
        {errors.map((err, i) => (
          <li key={i}>{err}</li>
        ))}
      </ul>,
    );
  }
};

const _onOpenFile = onOpenFile;
// if (_onOpenFile) {
const initFiles: OpenFileItem[] = [];
const $didInit = createStore(false).on(filesDidWakeUp, () => true);
filesDidWakeUp.watch(() => {
  console.log(">>>> onOpenFile from init");
  openFiles(initFiles);
});
_onOpenFile.watch((f) => {
  console.log(">>>> onOpenFile", f);
  if ($didInit.getState()) {
    console.log(">>>> onOpenFile after init", f);
    openFiles(f);
  } else {
    console.log(">>>> onOpenFile before init", f);
    initFiles.push(...f);
  }
});
// }

export const handleOpenClick = () =>
  openFile({
    multiple: true,
    done: openFiles,
  });
