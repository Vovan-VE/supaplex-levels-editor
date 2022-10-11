import { FC, useCallback } from "react";
import cn from "classnames";
import { useStore } from "effector-react";
import { getDriver } from "drivers";
import {
  $currentDriverName,
  $currentLevelUndoQueue,
  updateCurrentLevel,
} from "models/levelsets";
import { Button, Toolbar, ToolbarSeparator } from "ui/button";
import { useInputDebounce, ValueInput } from "ui/input";
import { ContainerProps } from "ui/types";
import { promptResizeLevel } from "./promptResizeLevel";
import cl from "./LevelConfig.module.scss";

const formatTitle = (value: string) => value.trimEnd();

interface Props extends ContainerProps {}

export const LevelConfig: FC<Props> = ({ className, ...rest }) => {
  const driverName = useStore($currentDriverName)!;
  const { LevelConfigurator } = getDriver(driverName)!;
  const undoQueue = useStore($currentLevelUndoQueue)!;
  const rawLevel = undoQueue.current;

  return (
    <Toolbar {...rest} className={cn(cl.root, className)}>
      <Button disabled={!rawLevel.resizable} onClick={promptResizeLevel}>
        {rawLevel.width}x{rawLevel.height}
      </Button>
      <ValueInput
        // 1. Using `ValueInput` so the title "value" is a raw title with
        // trailing spaces, but title "input" is trimmed. Otherwise, UX will be
        // inconvenient either in one thing or another.
        // 2. Using input debouncing to not explode UndoQueue with every letter
        // typing.
        //
        // Both these two things cause good UX.
        parseInput={useCallback(
          (input) => input.padEnd(rawLevel.maxTitleLength, " "),
          [rawLevel.maxTitleLength],
        )}
        formatValue={formatTitle}
        emptyValue=""
        {...useInputDebounce({
          value: rawLevel.title,
          onChangeEnd: useCallback(
            (title: string) => updateCurrentLevel(rawLevel.setTitle(title)),
            [rawLevel],
          ),
          debounceTimeout: 60 * 1000,
        })}
        maxLength={rawLevel.maxTitleLength}
        className={cl.title}
      />

      {LevelConfigurator && (
        <>
          <ToolbarSeparator />
          <LevelConfigurator level={rawLevel} onChange={updateCurrentLevel} />
        </>
      )}
    </Toolbar>
  );
};
