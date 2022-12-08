import { useStore } from "effector-react";
import {
  FC,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { canResize, getDriverFormat } from "drivers";
import {
  $currentDriverFormat,
  $currentDriverName,
  $currentLevelUndoQueue,
  updateCurrentLevel,
} from "models/levelsets";
import { Button } from "ui/button";
import {
  Dialog,
  intRangeError,
  renderPrompt,
  RenderPromptProps,
} from "ui/feedback";
import { Field, IntegerInput } from "ui/input";
import { ColorType } from "ui/types";
import { NoticeSizeLags } from "./NoticeSizeLags";
import cl from "./ResizeLevel.module.scss";

interface Props extends RenderPromptProps<true> {}

const ResizeLevel: FC<Props> = ({ show, onSubmit, onCancel }) => {
  const { resizable } = getDriverFormat(
    useStore($currentDriverName)!,
    useStore($currentDriverFormat)!,
  )!;
  const undoQueue = useStore($currentLevelUndoQueue)!;
  const rawLevel = undoQueue.current;
  useEffect(() => onCancel, [rawLevel, onCancel]);

  const [width, setWidth] = useState<number | null>(rawLevel.width);
  const [height, setHeight] = useState<number | null>(rawLevel.height);

  const handleOk = useCallback(() => {
    if (
      !canResize(resizable) ||
      !rawLevel.resize ||
      width === null ||
      height === null
    ) {
      return;
    }
    const { minWidth = 1, minHeight = 1, maxWidth, maxHeight } = resizable;
    if (width < minWidth || height < minHeight) {
      return;
    }
    if (maxWidth !== undefined && width > maxWidth) {
      return;
    }
    if (maxHeight !== undefined && height > maxHeight) {
      return;
    }
    // TODO: option: set border after resize
    let newLevel = rawLevel.resize(width, height);
    updateCurrentLevel(newLevel);
    onSubmit(true);
  }, [onSubmit, width, height, resizable, rawLevel]);

  const isResizable = canResize(resizable);

  return (
    <Dialog
      title="Resize level"
      size="small"
      open={show}
      wrapForm={useMemo(
        () => ({
          onSubmit: (e: FormEvent) => {
            e.preventDefault();
            handleOk();
          },
        }),
        [handleOk],
      )}
      buttons={
        <>
          {isResizable && (
            <Button uiColor={ColorType.SUCCESS} type="submit">
              OK
            </Button>
          )}
          <Button type="button" onClick={onCancel}>
            Cancel
          </Button>
        </>
      }
      onClose={onCancel}
    >
      <div className={cl.root}>
        {isResizable ? (
          <>
            <p>
              Current size:{" "}
              <b>
                {rawLevel.width}x{rawLevel.height}
              </b>
            </p>
            <Field
              label="New Width"
              error={intRangeError(
                width,
                resizable.minWidth ?? 1,
                resizable.maxWidth,
              )}
            >
              <IntegerInput value={width} onChange={setWidth} required />
            </Field>
            <Field
              label="New Height"
              error={intRangeError(
                height,
                resizable.minHeight ?? 1,
                resizable.maxHeight,
              )}
            >
              <IntegerInput value={height} onChange={setHeight} required />
            </Field>

            {width !== null && height !== null && (
              <NoticeSizeLags totalTiles={width * height} />
            )}
          </>
        ) : (
          <p>Cannot change size for this level.</p>
        )}
      </div>
    </Dialog>
  );
};

export const promptResizeLevel = () =>
  renderPrompt((props) => <ResizeLevel {...props} />);
