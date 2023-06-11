import { FC } from "react";
import { InfoDetails, VersionTag } from "backend";
import { APP_TITLE, APP_VERSION } from "configs";
import { msgBox } from "ui/feedback";
import cl from "./InfoContent.module.scss";

export const showInfoDialog = () =>
  msgBox(<InfoContent />, {
    size: "full",
    closeSetAutoFocus: true,
    button: {
      text: "Close",
      autoFocus: false,
    },
  });

const VersionTagC = VersionTag;

const InfoContent: FC = () => (
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
        {VersionTagC && (
          <>
            {" "}
            (<VersionTagC />)
          </>
        )}
      </span>
    </h1>
    <p>
      <strong>{APP_TITLE}</strong> is <strong>Supaplex Levels Editor</strong>.
      Inspired by{" "}
      <a
        href="https://www.supaplex.online/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Supaplex.Online
      </a>{" "}
      and its community.
    </p>

    <InfoDetails />
  </div>
);
