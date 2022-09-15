import { FC, Fragment } from "react";
import cn from "classnames";
import { useStore } from "effector-react";
import { LevelBody, LevelToolbars } from "components/level";
import { $currentLevel } from "models/levelsets";
import { ContainerProps } from "ui/types";
import cl from "./LevelEditor.module.scss";

interface Props extends ContainerProps {}

export const LevelEditor: FC<Props> = ({ className, ...rest }) => {
  const current = useStore($currentLevel);

  return (
    <div {...rest} className={cn(cl.root, className)}>
      {current && (
        <Fragment key={current.index}>
          <LevelToolbars className={cl.toolbars} />
          <LevelBody className={cl.body} />
          <div className={cl.status}>status</div>
        </Fragment>
      )}
    </div>
  );
};
