import { FC } from "react";
import cn from "classnames";
import { useStore } from "effector-react";
import {
  $currentLevelUndoQueue,
  redoCurrentLevel,
  undoCurrentLevel,
} from "models/levelsets";
import { Button, Toolbar, ToolbarSeparator } from "ui/button";
import { svgs } from "ui/icon";
import { ContainerProps } from "ui/types";
import cl from "./EditorTools.module.scss";

interface Props extends ContainerProps {}

export const EditorTools: FC<Props> = ({ className, ...rest }) => {
  // const driverName = useStore($currentDriverName)!;
  // const driver = getDriver(driverName)!;
  const undoQueue = useStore($currentLevelUndoQueue)!;

  return (
    <Toolbar {...rest} className={cn(cl.root, className)}>
      <Button
        icon={<svgs.Undo />}
        disabled={!undoQueue.canUndo}
        onClick={undoCurrentLevel}
      />
      <Button
        icon={<svgs.Redo />}
        disabled={!undoQueue.canRedo}
        onClick={redoCurrentLevel}
      />
      <ToolbarSeparator />
      <Button icon={<svgs.Cut />} disabled />
      <Button icon={<svgs.Copy />} disabled />
      <Button icon={<svgs.Paste />} disabled />
      <Button icon={<svgs.DeleteSelection />} disabled />
      {/*<Button disabled>PNG</Button>*/}
      {/*<ToolbarSeparator />*/}
      {/*<Button disabled>Copy level to clipboard</Button>*/}
      {/*<Button disabled>Paste level from clipboard</Button>*/}
      {/*<Button disabled>Internal/System clipboard? (via textarea?)</Button>*/}
    </Toolbar>
  );
};
