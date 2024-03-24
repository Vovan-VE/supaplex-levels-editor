import { FC } from "react";
import { InfoDetails, VersionTag } from "backend";
import { APP_TITLE, APP_VERSION } from "configs";
import { Trans } from "i18n/Trans";
import { UpgradeLink } from "./UpgradeLink";
import cl from "./InfoContent.module.scss";

export const InfoContent: FC = () => (
  <div className={cl.root}>
    <img
      src="/favicon.svg"
      alt={APP_TITLE}
      width={96}
      height={96}
      className={cl.logo}
    />
    <h1>
      {APP_TITLE}{" "}
      <span>
        v{APP_VERSION}
        {VersionTag && (
          <>
            {" "}
            (<VersionTag />)
          </>
        )}
        {UpgradeLink && <UpgradeLink />}
      </span>
    </h1>
    <p>
      <Trans i18nKey="main:about.content.B010" values={{ APP_TITLE }} />
    </p>

    <InfoDetails />
  </div>
);
