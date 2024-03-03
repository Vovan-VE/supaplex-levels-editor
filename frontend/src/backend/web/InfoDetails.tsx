import { FC } from "react";
import { APP_TITLE, TEST_LEVEL_TITLE } from "configs";
import { Trans } from "i18n/Trans";

export const InfoDetails: FC = () => (
  <>
    <h3>
      <Trans i18nKey="web:about.content.A000" />
    </h3>
    <p>
      <Trans i18nKey="web:about.content.B010" />
    </p>
    <ul>
      <li>
        <Trans i18nKey="web:about.content.B020.I010" />
      </li>
      <li>
        <Trans i18nKey="web:about.content.B020.I020" />
      </li>
      <li>
        <Trans i18nKey="web:about.content.B020.I030" />
      </li>
    </ul>
    <p>
      <Trans i18nKey="web:about.content.B030" />
    </p>
    <ul>
      <li>
        <p>
          <Trans i18nKey="web:about.content.B040.I010.B010" />
        </p>
        <p>
          <Trans i18nKey="web:about.content.B040.I010.B020" />
        </p>
      </li>
      <li>
        <p>
          <Trans i18nKey="web:about.content.B040.I020.B010" />
        </p>
        <p>
          <Trans i18nKey="web:about.content.B040.I020.B020" />
        </p>
        <p>
          <Trans
            i18nKey="web:about.content.B040.I020.B030"
            values={{ SO: TEST_LEVEL_TITLE }}
          />
        </p>
      </li>
      <li>
        <p>
          <Trans i18nKey="web:about.content.B040.I030.B010" />
        </p>
        <p>
          <Trans
            i18nKey="web:about.content.B040.I030.B020"
            values={{ APP_TITLE }}
          />
        </p>
      </li>
    </ul>
  </>
);
