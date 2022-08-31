import { FC } from "react";
import cn from "classnames";
import { Button, Toolbar } from "ui/button";
import { svgs } from "ui/icon";
import { ContainerProps } from "ui/types";
import { EditorTabs } from "./EditorTabs";
import cl from "./Header.module.scss";

interface Props extends ContainerProps {}

export const Header: FC<Props> = ({ className, ...rest }) => (
  <header {...rest} className={cn(cl.root, className)}>
    <Toolbar className={cl.toolbar}>
      <Button icon={<svgs.FileBlank />} />
      <Button icon={<svgs.DirOpen />} />
    </Toolbar>
    <EditorTabs className={cl.tabs} />
  </header>
);
