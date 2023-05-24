import { FC, useMemo } from "react";
import cn from "classnames";
import { useStore } from "effector-react";
import { allowManualSave } from "backend";
import {
  $currentKey,
  $dirtyKeys,
  $levelsets,
  LevelsetFileKey,
  setCurrentLevelset,
} from "models/levelsets";
import { TabItem, TabsButtons } from "ui/button";
import { ColorType, ContainerProps } from "ui/types";
import cl from "./EditorTabs.module.scss";

interface Props extends ContainerProps {}

export const EditorTabs: FC<Props> = ({ className, ...rest }) => {
  const levelsets = useStore($levelsets);
  const currentKey = useStore($currentKey);
  const dirtyKeys = useStore($dirtyKeys);

  const tabs = useMemo(
    () =>
      [...levelsets].map<TabItem<LevelsetFileKey>>(([key, { name }]) => ({
        key,
        text: name,
        uiColor:
          allowManualSave && dirtyKeys.has(key) ? ColorType.WARN : undefined,
      })),
    [levelsets, dirtyKeys],
  );

  return (
    <TabsButtons
      {...rest}
      tabs={tabs}
      current={currentKey ?? undefined}
      onClick={setCurrentLevelset}
      className={cn(cl.root, className)}
    />
  );
};
