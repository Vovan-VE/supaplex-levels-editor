import { useStore } from "effector-react";
import { FC, ReactNode } from "react";
import {
  $bodyScaleCanDec,
  $bodyScaleCanInc,
  decBodyScale,
  incBodyScale,
} from "models/levels";
import { displayHotKey, useHotKey } from "models/ui/hotkeys";
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
        title={`Zoom In (${displayHotKey(HK_ZOOM_IN)})`}
      />
      {space}
      <TextButton
        icon={<svgs.MinusSquare />}
        className={btnClassName}
        onClick={decBodyScale}
        disabled={!canZoomOut}
        title={`Zoom Out (${displayHotKey(HK_ZOOM_OUT)})`}
      />
    </>
  );
};
