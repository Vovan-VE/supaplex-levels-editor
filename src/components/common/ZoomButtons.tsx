import { useStore } from "effector-react";
import { FC, ReactNode } from "react";
import {
  $bodyScaleCanDec,
  $bodyScaleCanInc,
  decBodyScale,
  incBodyScale,
} from "models/levels";
import { TextButton } from "ui/button";
import { svgs } from "ui/icon";

interface Props {
  btnClassName?: string;
  space?: ReactNode;
}

export const ZoomButtons: FC<Props> = ({ btnClassName, space }) => (
  <>
    <TextButton
      icon={<svgs.PlusSquare />}
      className={btnClassName}
      onClick={incBodyScale}
      disabled={!useStore($bodyScaleCanInc)}
      title="Zoom In"
    />
    {space}
    <TextButton
      icon={<svgs.MinusSquare />}
      className={btnClassName}
      onClick={decBodyScale}
      disabled={!useStore($bodyScaleCanDec)}
      title="Zoom Out"
    />
  </>
);
