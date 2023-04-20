import cn from "classnames";
import { FC, useCallback, useMemo } from "react";
import { Range as RRange } from "react-range";
import {
  IProps,
  IRenderThumbParams,
  IRenderTrackParams,
} from "react-range/lib/types";
import { ContainerProps } from "../../types";
import cl from "./Range.module.scss";

interface IPropsRequired extends Pick<IProps, "min" | "max"> {}
interface IPropsOptional extends Partial<Pick<IProps, "step" | "disabled">> {}

interface Props extends IPropsRequired, IPropsOptional, ContainerProps {
  value: number;
  onChange: (value: number) => void;
  onFinalChange?: (value: number) => void;
}

export const Range: FC<Props> = ({
  min,
  max,
  step,
  disabled = false,
  value,
  onChange,
  onFinalChange,
  className,
  ...rest
}) => (
  <RRange
    min={min}
    max={max}
    step={step}
    disabled={disabled}
    values={useMemo(() => [value], [value])}
    onChange={useCallback((values) => onChange(values[0]), [onChange])}
    onFinalChange={useMemo(
      () => onFinalChange && ((values) => onFinalChange(values[0])),
      [onFinalChange],
    )}
    renderTrack={({
      props,
      disabled,
      // isDragged,
      children,
    }: IRenderTrackParams) => (
      <div
        {...rest}
        className={cn(cl.root, disabled && cl._disabled, className)}
      >
        <span className={cl.value}>
          <span className={cl.keep}>{max}</span>
          <span className={cl.display}>{value}</span>
        </span>
        <div {...props} className={cl.track}>
          {children}
        </div>
      </div>
    )}
    renderThumb={({
      props,
    }: // value,
    // index,
    // isDragged,
    IRenderThumbParams) => (
      <button {...props} className={cl.thumb} disabled={disabled} />
    )}
  />
);
