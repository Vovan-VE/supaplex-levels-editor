import { FC } from "react";
import cn from "classnames";
import { ReactComponent as GitHubLogo } from "assets/img/github.svg";
import { VersionTag } from "backend";
import { APP_VERSION, REPO_URL, VERSION_URL } from "configs";
import { showInfoDialog, ZoomButtons } from "components/common";
import { HoveredCell } from "components/level";
import { openSettings } from "models/settings";
import { TextButton } from "ui/button";
import { svgs } from "ui/icon";
import { ContainerProps } from "ui/types";
import cl from "./Footer.module.scss";

const VersionTagC = VersionTag;

interface Props extends ContainerProps {}

export const Footer: FC<Props> = ({ className, ...rest }) => (
  <footer {...rest} className={cn(cl.root, className)}>
    <TextButton
      href={REPO_URL}
      target="_blank"
      rel="noopener"
      icon={<GitHubLogo />}
      className={cl.icon}
    />{" "}
    <TextButton
      href={VERSION_URL}
      target="_blank"
      rel="noopener"
      className={cl.text}
    >
      v{APP_VERSION}
      {VersionTagC && (
        <>
          {" "}
          (<VersionTagC />)
        </>
      )}
    </TextButton>{" "}
    <span className={cl.space} />
    <HoveredCell className={cl.text} />
    <span className={cl.space} />
    <ZoomButtons btnClassName={cl.icon} space=" " />{" "}
    <TextButton
      icon={<svgs.Wrench />}
      className={cl.icon}
      onClick={openSettings}
      title="Settings"
    />{" "}
    <TextButton
      icon={<svgs.Info />}
      className={cl.icon}
      onClick={showInfoDialog}
      title="Info"
    />
  </footer>
);
