import { createEffect, createEvent, merge, sample } from "effector";
import { setClipboardText } from "backend";
import { TEST_DEMO_URL, TEST_LEVEL_URL } from "configs";
import {
  getDriver,
  getDriverFormat,
  IBaseLevel,
  levelSupportsDemo,
} from "drivers";
import { Trans } from "i18n/Trans";
import { ColorType } from "ui/types";
import { base64Encode } from "utils/encoding/base64";
import { tryGzipCompress } from "utils/encoding/gzip";
import {
  $currentDriverFormat,
  $currentDriverName,
  $currentLevelUndoQueue,
} from "../levelsets";
import { showToast, showToastError } from "../ui/toasts";

export const exportLevelAsLink = async (
  level: IBaseLevel,
  baseUrl: string,
  withDemo: boolean,
) => {
  if (!withDemo && levelSupportsDemo(level)) {
    level = level.setDemo(null);
  }

  const driverName = $currentDriverName.getState()!;
  const { applyLocalOptions } = getDriver(driverName)!;
  const { writeLevelset, createLevelset } = getDriverFormat(
    driverName,
    $currentDriverFormat.getState()!,
  )!;
  const url = new URL(baseUrl);
  applyLocalOptions?.(level, url);
  const raw = writeLevelset(createLevelset([level]));
  const compressed = await tryGzipCompress(raw);
  url.hash = compressed
    ? "#gz," + base64Encode(compressed)
    : "#" + base64Encode(raw);
  return url;
};

export const copyLevelAsTestLink = createEvent<unknown>();
export const copyLevelAsDemoLink = createEvent<unknown>();

const copyLevelAsTextLinkFx = createEffect(
  async (level: IBaseLevel) =>
    await setClipboardText(
      (await exportLevelAsLink(level, TEST_LEVEL_URL, false)).toString(),
    ),
);
const copyLevelAsDemoLinkFx = createEffect(
  async (level: IBaseLevel) =>
    await setClipboardText(
      (await exportLevelAsLink(level, TEST_DEMO_URL, true)).toString(),
    ),
);
merge([copyLevelAsTextLinkFx.done, copyLevelAsDemoLinkFx.done]).watch(() =>
  showToast({
    message: <Trans i18nKey="main:common.toasts.LinkCopied" />,
    color: ColorType.SUCCESS,
  }),
);
merge([copyLevelAsTextLinkFx.fail, copyLevelAsDemoLinkFx.fail]).watch(
  showToastError,
);

for (const [clock, target] of [
  [copyLevelAsTestLink, copyLevelAsTextLinkFx],
  [copyLevelAsDemoLink, copyLevelAsDemoLinkFx],
] as const) {
  sample({
    clock,
    source: $currentLevelUndoQueue,
    filter: Boolean,
    fn: (u) => u.current,
    target,
  });
}
