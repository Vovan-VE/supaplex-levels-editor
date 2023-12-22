import { useUnit } from "effector-react";
import { FC, FormEventHandler, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { TileSelect } from "components/driver/TileSelect";
import { canResize, getDriverFormat } from "drivers";
import { TILE_HARDWARE } from "drivers/supaplex/tiles-id";
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
  const { t } = useTranslation();
  const driverName = useUnit($currentDriverName);
  const { resizable } = getDriverFormat(
    driverName!,
    useUnit($currentDriverFormat)!,
  )!;
  const undoQueue = useUnit($currentLevelUndoQueue)!;
  const rawLevel = undoQueue.current;
  useEffect(() => onCancel, [rawLevel, onCancel]);

  const [width, setWidth] = useState<number | null>(rawLevel.width);
  const [height, setHeight] = useState<number | null>(rawLevel.height);
  // TODO: define defaults in driver
  const [borderTile, setBorderTile] = useState(TILE_HARDWARE);
  const [fillTile, setFillTile] = useState(0);

  const handleOk = useCallback<FormEventHandler>(
    (e) => {
      e.preventDefault();
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

      // TODO: option: x & y offset
      updateCurrentLevel(
        rawLevel.resize({ width, height, borderTile, fillTile }),
      );
      onSubmit(true);
    },
    [onSubmit, width, height, borderTile, fillTile, resizable, rawLevel],
  );

  const isResizable = canResize(resizable);

  return (
    <Dialog
      title={t("main:level.resize.DialogTitle")}
      size="small"
      open={show}
      wrapForm={{ onSubmit: handleOk }}
      buttons={
        <>
          {isResizable && (
            <Button uiColor={ColorType.SUCCESS} type="submit">
              {t("main:common.buttons.OK")}
            </Button>
          )}
          <Button type="button" onClick={onCancel}>
            {t("main:common.buttons.Cancel")}
          </Button>
        </>
      }
      onClose={onCancel}
    >
      <div className={cl.root}>
        {isResizable ? (
          <>
            <p>
              {t("main:level.resize.labels.CurrentSize")}{" "}
              <b>
                {rawLevel.width}x{rawLevel.height}
              </b>
            </p>
            <div className={cl.row}>
              <Field
                label={t("main:level.resize.labels.NewWidth")}
                error={intRangeError(
                  width,
                  resizable.minWidth ?? 1,
                  resizable.maxWidth,
                )}
              >
                <IntegerInput value={width} onChange={setWidth} required />
              </Field>
              <Field
                label={t("main:level.resize.labels.NewHeight")}
                error={intRangeError(
                  height,
                  resizable.minHeight ?? 1,
                  resizable.maxHeight,
                )}
              >
                <IntegerInput value={height} onChange={setHeight} required />
              </Field>
            </div>

            {width !== null && height !== null && (
              <NoticeSizeLags totalTiles={width * height} />
            )}

            <p>{t("main:level.resize.labels.FillNewEmptySpace")}</p>
            <div className={cl.row}>
              <Field label={t("main:level.resize.labels.Border")}>
                <TileSelect
                  driverName={driverName as any}
                  tile={borderTile}
                  onChange={setBorderTile}
                />
              </Field>
              <Field label={t("main:level.resize.labels.FillBody")}>
                <TileSelect
                  driverName={driverName as any}
                  tile={fillTile}
                  onChange={setFillTile}
                />
              </Field>
            </div>
          </>
        ) : (
          <p>{t("main:level.resize.ResizeNotSupported")}</p>
        )}
      </div>
    </Dialog>
  );
};

export const promptResizeLevel = () =>
  renderPrompt((props) => <ResizeLevel {...props} />);
