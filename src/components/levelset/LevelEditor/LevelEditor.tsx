import { FC } from "react";
import cn from "classnames";
import { useStore } from "effector-react";
import { LevelBody, LevelToolbars } from "components/level";
import { $currentLevelIndex } from "models/levelsets";
import { ContainerProps } from "ui/types";
import cl from "./LevelEditor.module.scss";

interface Props extends ContainerProps {}

export const LevelEditor: FC<Props> = ({ className, ...rest }) => {
  const levelIndex = useStore($currentLevelIndex);

  return (
    <div {...rest} className={cn(cl.root, className)}>
      {levelIndex !== null && (
        <>
          <LevelToolbars className={cl.toolbars} />
          <LevelBody className={cl.body} />
          {/*<div className={cl.status}>status</div>*/}
        </>
      )}
    </div>
  );
};
