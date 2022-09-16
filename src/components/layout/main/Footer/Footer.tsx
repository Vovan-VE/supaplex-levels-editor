import { FC } from "react";
import cn from "classnames";
import { ReactComponent as GitHubLogo } from "assets/img/github.svg";
import { APP_VERSION, REPO_URL } from "configs";
import { decBodyScale, incBodyScale } from "models/levels";
import { TextButton } from "ui/button";
import { msgBox } from "ui/feedback";
import { svgs } from "ui/icon";
import { ContainerProps } from "ui/types";
import { InfoContent } from "./InfoContent";
import cl from "./Footer.module.scss";

interface Props extends ContainerProps {}

export const Footer: FC<Props> = ({ className, ...rest }) => (
  <footer {...rest} className={cn(cl.root, className)}>
    <TextButton href={REPO_URL} icon={<GitHubLogo />} className={cl.icon} />{" "}
    <span className={cl.text}>v{APP_VERSION}</span>{" "}
    <span className={cl.text}>© 2021—2022 Vovan-VE</span>{" "}
    <span className={cl.space} />
    <TextButton
      icon={<svgs.PlusSquare />}
      className={cl.icon}
      onClick={incBodyScale}
    />{" "}
    <TextButton
      icon={<svgs.MinusSquare />}
      className={cl.icon}
      onClick={decBodyScale}
    />{" "}
    <TextButton
      icon={<svgs.Info />}
      className={cl.icon}
      onClick={handleInfoClick}
    />{" "}
  </footer>
);

const handleInfoClick = () => msgBox(<InfoContent />, { size: "full" });
