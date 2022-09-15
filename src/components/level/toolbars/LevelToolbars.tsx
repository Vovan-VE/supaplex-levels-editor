import { FC } from "react";
import cn from "classnames";
import { ContainerProps } from "ui/types";
import { EditorTools } from "./EditorTools";
import { LevelConfig } from "./LevelConfig";
import { TilesToolbar } from "./TilesToolbar";
import cl from "./LevelToolbars.module.scss";

interface Props extends ContainerProps {}

export const LevelToolbars: FC<Props> = ({ className, ...rest }) => {
  return (
    <div {...rest} className={cn(cl.root, className)}>
      <LevelConfig className={cl.config} />
      <EditorTools className={cl.tools} />
      <TilesToolbar className={cl.tiles} />
    </div>
  );
};
