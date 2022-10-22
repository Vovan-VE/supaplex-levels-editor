import cn from "classnames";
import { FC, ReactNode, useMemo } from "react";
import { ContainerProps } from "../../types";
import { CheckboxRender } from "../Checkbox/CheckboxRender";
import cl from "./RadioGroup.module.scss";

export interface RadioOption<V = string> {
  value: V;
  label: ReactNode;
}
export type RadioOptions<V = string> = readonly RadioOption<V>[];

interface Props<V> extends ContainerProps {
  options: RadioOptions<V>;
  value?: V;
  onChange?: (value: V) => void;
}

export const RadioGroup = <V,>({
  options,
  value,
  onChange,
  className,
  ...rest
}: Props<V>): ReturnType<FC> => {
  const handleChange = useMemo(
    () =>
      onChange
        ? options.map(
            ({ value }) =>
              () =>
                onChange(value),
          )
        : undefined,
    [onChange, options],
  );

  return (
    <div {...rest} className={cn(cl.root, className)}>
      {options.map((o, i) => (
        <CheckboxRender
          key={i}
          _radio
          checked={value !== undefined && o.value === value}
          onChange={handleChange?.[i]}
        >
          {o.label}
        </CheckboxRender>
      ))}
    </div>
  );
};
