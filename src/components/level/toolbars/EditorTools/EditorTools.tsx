import { FC } from "react";
import cn from "classnames";
import { useStore } from "effector-react";
import {
  $currentLevelUndoQueue,
  redoCurrentLevel,
  undoCurrentLevel,
} from "models/levelsets";
import { Button, Toolbar, ToolbarSeparator } from "ui/button";
import { ContainerProps } from "ui/types";
import cl from "./EditorTools.module.scss";

interface Props extends ContainerProps {}

export const EditorTools: FC<Props> = ({ className, ...rest }) => {
  // const driverName = useStore($currentDriverName)!;
  // const driver = getDriver(driverName)!;
  const undoQueue = useStore($currentLevelUndoQueue)!;

  return (
    <Toolbar {...rest} className={cn(cl.root, className)}>
      <Button disabled={!undoQueue.canUndo} onClick={undoCurrentLevel}>
        Undo
      </Button>
      <Button disabled={!undoQueue.canRedo} onClick={redoCurrentLevel}>
        Redo
      </Button>
      <ToolbarSeparator />
      <Button disabled>Cut</Button>
      <Button disabled>Copy</Button>
      <Button disabled>Paste</Button>
      <Button disabled>Delete</Button>
      {/*<Button disabled>PNG</Button>*/}
      {/*<ToolbarSeparator />*/}
      {/*<Button disabled>Copy level to clipboard</Button>*/}
      {/*<Button disabled>Paste level from clipboard</Button>*/}
      {/*<Button disabled>Internal/System clipboard? (via textarea?)</Button>*/}
    </Toolbar>
  );
};
