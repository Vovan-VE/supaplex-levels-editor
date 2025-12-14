import cn from "classnames";
import { FC, ReactNode, useId, useMemo } from "react";
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
  flowInline?: boolean;
  name?: string;
  disabled?: boolean;
}

export const RadioGroup = <V,>({
  options,
  value,
  onChange,
  flowInline = false,
  name,
  disabled,
  className,
  ...rest
}: Props<V>): ReturnType<FC> => {
  const fallbackName = useId();
  const _name = name ?? fallbackName;

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
    <div
      {...rest}
      className={cn(cl.root, flowInline ? cl._inline : cl._rows, className)}
    >
      {options.map((o, i) => (
        <CheckboxRender
          key={i}
          _radio
          checked={value !== undefined && o.value === value}
          onChange={handleChange?.[i]}
          name={_name}
          disabled={disabled}
        >
          {o.label}
        </CheckboxRender>
      ))}
    </div>
  );
};
