import { combine, createEffect, createEvent, restore, sample } from "effector";
import { useUnit } from "effector-react";
import { FC, useEffect } from "react";
import { Environment } from "./runtime";

const fetchFx = createEffect(Environment);
const $info = restore(fetchFx.doneData, null);
const fetch = createEvent<void>();
sample({
  source: fetch,
  filter: combine($info, fetchFx.pending, (i, p) => !i && !p),
  target: fetchFx,
});

export const VersionTag: FC = () => {
  useEffect(() => fetch(), []);
  const info = useUnit($info);
  return info ? (
    <>
      {info.platform} {info.arch} {info.buildType}
    </>
  ) : (
    <>...</>
  );
};
