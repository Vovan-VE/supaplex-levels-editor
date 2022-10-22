import { FC } from "react";
import cn from "classnames";
import { useStore } from "effector-react";
import { ReactComponent as GitHubLogo } from "assets/img/github.svg";
import { APP_VERSION, REPO_URL, VERSION_URL } from "configs";
import { TileCoords } from "components/settings/display";
import {
  $bodyScaleCanDec,
  $bodyScaleCanInc,
  decBodyScale,
  incBodyScale,
} from "models/levels";
import { $feedbackCell } from "models/levels/tools";
import { openSettings } from "models/settings";
import { TextButton } from "ui/button";
import { msgBox } from "ui/feedback";
import { svgs } from "ui/icon";
import { ContainerProps } from "ui/types";
import { InfoContent } from "./InfoContent";
import cl from "./Footer.module.scss";

interface Props extends ContainerProps {}

export const Footer: FC<Props> = ({ className, ...rest }) => (
  <footer {...rest} className={cn(cl.root, className)}>
    <TextButton
      href={REPO_URL}
      target="_blank"
      rel="noopener noreferrer"
      icon={<GitHubLogo />}
      className={cl.icon}
    />{" "}
    <TextButton
      href={VERSION_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={cl.text}
    >
      v{APP_VERSION}
    </TextButton>{" "}
    <span className={cl.space} />
    <HoveredCell />
    <span className={cl.space} />
    <TextButton
      icon={<svgs.PlusSquare />}
      className={cl.icon}
      onClick={incBodyScale}
      disabled={!useStore($bodyScaleCanInc)}
      title="Zoom In"
    />{" "}
    <TextButton
      icon={<svgs.MinusSquare />}
      className={cl.icon}
      onClick={decBodyScale}
      disabled={!useStore($bodyScaleCanDec)}
      title="Zoom Out"
    />{" "}
    <TextButton
      icon={<svgs.Wrench />}
      className={cl.icon}
      onClick={openSettings}
      title="Settings"
    />{" "}
    <TextButton
      icon={<svgs.Info />}
      className={cl.icon}
      onClick={handleInfoClick}
      title="Info"
    />
  </footer>
);

const handleInfoClick = () =>
  msgBox(<InfoContent />, {
    size: "full",
    closeSetAutoFocus: true,
    button: {
      text: "Close",
      autoFocus: false,
    },
  });

const HoveredCell: FC = () => {
  const feedback = useStore($feedbackCell);
  if (!feedback) {
    return null;
  }
  return (
    <span className={cl.text}>
      <TileCoords {...feedback} />
    </span>
  );
};
