import { useStore } from "effector-react";
import { FC, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  $bodyScaleCanDec,
  $bodyScaleCanInc,
  decBodyScale,
  incBodyScale,
} from "models/levels";
import { hintWithHotkey, useHotKey } from "models/ui/hotkeys";
import { HK_ZOOM_IN, HK_ZOOM_OUT } from "models/ui/hotkeys-defined";
import { TextButton } from "ui/button";
import { svgs } from "ui/icon";

const handleZoomIn = (e: UIEvent) => {
  e.preventDefault();
  incBodyScale();
};
const handleZoomOut = (e: UIEvent) => {
  e.preventDefault();
  decBodyScale();
};
const noopHandler = (e: UIEvent) => {
  e.preventDefault();
};

interface Props {
  btnClassName?: string;
  space?: ReactNode;
}

export const ZoomButtons: FC<Props> = ({ btnClassName, space }) => {
  const { t } = useTranslation();

  const canZoomIn = useStore($bodyScaleCanInc);
  const canZoomOut = useStore($bodyScaleCanDec);

  useHotKey({
    shortcut: HK_ZOOM_IN,
    handler: canZoomIn ? handleZoomIn : noopHandler,
  });
  useHotKey({
    shortcut: HK_ZOOM_OUT,
    handler: canZoomOut ? handleZoomOut : noopHandler,
  });

  return (
    <>
      <TextButton
        icon={<svgs.PlusSquare />}
        className={btnClassName}
        onClick={incBodyScale}
        disabled={!canZoomIn}
        title={hintWithHotkey(t("main:common.buttons.ZoomIn"), HK_ZOOM_IN)}
      />
      {space}
      <TextButton
        icon={<svgs.MinusSquare />}
        className={btnClassName}
        onClick={decBodyScale}
        disabled={!canZoomOut}
        title={hintWithHotkey(t("main:common.buttons.ZoomOut"), HK_ZOOM_OUT)}
      />
    </>
  );
};
