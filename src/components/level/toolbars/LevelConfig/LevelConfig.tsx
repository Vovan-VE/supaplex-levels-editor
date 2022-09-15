import { FC } from "react";
import cn from "classnames";
import { useStore } from "effector-react";
import { getDriver } from "drivers";
import { $currentLevel, $currentLevelsetFile } from "models/levelsets";
import { Button, Toolbar } from "ui/button";
import { Input } from "ui/input";
import { ContainerProps } from "ui/types";
import cl from "./LevelConfig.module.scss";

interface Props extends ContainerProps {}

export const LevelConfig: FC<Props> = ({ className, ...rest }) => {
  const levelset = useStore($currentLevelsetFile)!;
  const driver = getDriver(levelset.driverName)!;
  const { level } = useStore($currentLevel)!;
  const rawLevel = level.undoQueue.current;

  return (
    <Toolbar {...rest} className={cn(cl.root, className)}>
      <Button disabled={!rawLevel.resizable}>
        {rawLevel.width}x{rawLevel.height}
      </Button>
      <Input
        value={rawLevel.title}
        readOnly
        maxLength={rawLevel.maxTitleLength}
        className={cl.title}
      />
      {/* TODO: configurator from driver */}
    </Toolbar>
  );
};
