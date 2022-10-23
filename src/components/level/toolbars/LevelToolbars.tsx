import { FC } from "react";
import cn from "classnames";
import { Toolbar } from "ui/button";
import { ContainerProps } from "ui/types";
import { EditToolbar } from "./EditToolbar";
import { EditorTools } from "./EditorTools";
import { LevelConfig } from "./LevelConfig";
import { TilesToolbar } from "./TilesToolbar";
import cl from "./LevelToolbars.module.scss";

interface Props extends ContainerProps {}

export const LevelToolbars: FC<Props> = ({ className, ...rest }) => (
  <div {...rest} className={cn(cl.root, className)}>
    <Toolbar className={cl.edit}>
      <EditToolbar />
    </Toolbar>
    <Toolbar className={cl.config}>
      <LevelConfig />
    </Toolbar>
    <EditorTools className={cl.tools} />
    <TilesToolbar className={cl.tiles} />
  </div>
);
