import { FC, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useUnit } from "effector-react";
import { canResize, getDriverFormat } from "drivers";
import {
  $currentDriverFormat,
  $currentDriverName,
  $currentLevelUndoQueue,
  updateCurrentLevel,
} from "models/levelsets";
import { showToastError } from "models/ui/toasts";
import { Button } from "ui/button";
import { useInputDebounce, ValueInput } from "ui/input";
import { promptResizeLevel } from "./promptResizeLevel";
import cl from "./LevelConfig.module.scss";

const formatTitle = (value: string) => value.trimEnd();

interface Props {
  onDidResize?: () => void;
}

export const LevelConfig: FC<Props> = ({ onDidResize }) => {
  const { t } = useTranslation();
  const driverName = useUnit($currentDriverName)!;
  const { resizable } = getDriverFormat(
    driverName,
    useUnit($currentDriverFormat)!,
  )!;
  const undoQueue = useUnit($currentLevelUndoQueue)!;
  const rawLevel = undoQueue.current;

  const handleResizeClick = useCallback(async () => {
    if (await promptResizeLevel()) {
      onDidResize?.();
    }
  }, [onDidResize]);

  return (
    <>
      <Button
        disabled={!canResize(resizable)}
        onClick={handleResizeClick}
        title={t("main:level.buttons.Resize")}
      >
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
            (title: string) => {
              try {
                updateCurrentLevel(rawLevel.setTitle(title));
              } catch (e) {
                showToastError(e);
              }
            },
            [rawLevel],
          ),
          debounceTimeout: 60 * 1000,
        })}
        maxLength={rawLevel.maxTitleLength}
        className={cl.title}
      />
    </>
  );
};
