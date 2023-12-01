import { createEffect, restore, sample } from "effector";
import { createGate, useStore } from "effector-react";
import { FC } from "react";
import { APP_TITLE } from "configs";
import { Trans } from "i18n/Trans";
import { GetAppInfo } from "./go/main/App";

const fetchFx = createEffect(GetAppInfo);
const $appInfo = restore(fetchFx.doneData, "");
const FetchGate = createGate();
sample({
  source: FetchGate.open,
  filter: $appInfo.map((s) => !s),
  target: fetchFx,
});

export const InfoDetails: FC = () => (
  <>
    <h3>
      <Trans i18nKey="desktop:about.content.A000" />
    </h3>
    <p>
      <Trans
        i18nKey="desktop:about.content.B010"
        values={{ APP_TITLE }}
        components={{
          linkWails: (
            // eslint-disable-next-line jsx-a11y/anchor-has-content
            <a
              href="https://github.com/wailsapp/wails"
              target="_blank"
              rel="noopener noreferrer"
            />
          ),
        }}
      />
    </p>
    <p>
      <Trans i18nKey="desktop:about.content.B020" />
    </p>

    <h3>
      <Trans i18nKey="desktop:about.content.C000" />
    </h3>
    <FetchGate />
    <pre>{useStore($appInfo)}</pre>
  </>
);
