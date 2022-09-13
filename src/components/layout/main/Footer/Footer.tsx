import { FC } from "react";
import cn from "classnames";
import { ReactComponent as GitHubLogo } from "assets/img/github.svg";
import { REPO_URL, VERSION } from "configs";
import { TextButton } from "ui/button";
import { msgBox } from "ui/feedback";
import { svgs } from "ui/icon";
import { ContainerProps } from "ui/types";
import { InfoContent } from "./InfoContent";
import cl from "./Footer.module.scss";

interface Props extends ContainerProps {}

export const Footer: FC<Props> = ({ className, ...rest }) => (
  <footer {...rest} className={cn(cl.root, className)}>
    <span className={cl.text}>© 2021—2022 Vovan-VE</span>{" "}
    <TextButton href={REPO_URL} icon={<GitHubLogo />} className={cl.icon} />{" "}
    <span className={cl.space} />
    <TextButton
      icon={<svgs.Info />}
      className={cl.icon}
      onClick={handleInfoClick}
    />{" "}
    <span className={cl.text}>v{VERSION}</span>{" "}
  </footer>
);

const handleInfoClick = () => msgBox(<InfoContent />, { size: "full" });
