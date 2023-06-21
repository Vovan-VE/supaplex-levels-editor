import { createEffect, createEvent, merge, sample } from "effector";
import { TEST_DEMO_URL, TEST_LEVEL_URL } from "configs";
import { getDriverFormat, IBaseLevel, levelSupportsDemo } from "drivers";
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
  const { writeLevelset, createLevelset } = getDriverFormat(
    driverName,
    $currentDriverFormat.getState()!,
  )!;
  const url = new URL(baseUrl);
  const raw = writeLevelset(createLevelset([level]));
  const compressed = await tryGzipCompress(raw);
  url.hash = compressed ? "gz," + base64Encode(compressed) : base64Encode(raw);
  return url;
};

export const copyLevelAsTestLink = createEvent<any>();
export const copyLevelAsDemoLink = createEvent<any>();

const copyText = (text: string) => window.navigator.clipboard.writeText(text);
const copyLevelAsTextLinkFx = createEffect(async (level: IBaseLevel) =>
  copyText((await exportLevelAsLink(level, TEST_LEVEL_URL, false)).toString()),
);
const copyLevelAsDemoLinkFx = createEffect(async (level: IBaseLevel) =>
  copyText((await exportLevelAsLink(level, TEST_DEMO_URL, true)).toString()),
);
merge([copyLevelAsTextLinkFx.done, copyLevelAsDemoLinkFx.done]).watch(() =>
  showToast({ message: "Link copied", color: ColorType.SUCCESS }),
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
