import { FC, Fragment } from "react";
import cn from "classnames";
import { useStoreMap } from "effector-react";
import { LevelBody, LevelToolbars } from "components/level";
import { $currentLevel } from "models/levelsets";
import { ContainerProps } from "ui/types";
import cl from "./LevelEditor.module.scss";

interface Props extends ContainerProps {}

export const LevelEditor: FC<Props> = ({ className, ...rest }) => {
  const levelIndex = useStoreMap($currentLevel, (cur) => cur && cur.index);

  return (
    <div {...rest} className={cn(cl.root, className)}>
      {levelIndex !== null && (
        <Fragment key={levelIndex}>
          <LevelToolbars className={cl.toolbars} />
          <LevelBody className={cl.body} />
          {/*<div className={cl.status}>status</div>*/}
        </Fragment>
      )}
    </div>
  );
};
