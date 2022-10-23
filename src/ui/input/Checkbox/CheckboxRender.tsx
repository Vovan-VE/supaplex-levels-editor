import { ChangeEventHandler, FC, useCallback } from "react";
import cn from "classnames";
import { IconContainer, svgs } from "../../icon";
import { CheckboxCoreProps } from "./types";
import cl from "./CheckboxRender.module.scss";

interface Props extends CheckboxCoreProps {
  _radio: boolean;
}

export const CheckboxRender: FC<Props> = ({
  _radio,
  checked = false,
  onChange,
  name,
  children,
  className,
  ...rest
}) => {
  const handleChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      onChange?.(e.target.checked);
    },
    [onChange],
  );

  return (
    <label {...rest} className={cn(cl.root, className)}>
      <span className={cl.wrap}>
        <IconContainer className={cl.icon}>
          {checked ? (
            _radio ? (
              <svgs.CheckboxDot />
            ) : (
              <svgs.CheckboxChecked />
            )
          ) : (
            <svgs.CheckboxUnchecked />
          )}
        </IconContainer>
        <input
          type={_radio ? "radio" : "checkbox"}
          checked={checked}
          onChange={handleChange}
          name={name}
        />
      </span>
      <span>{children}</span>
    </label>
  );
};
