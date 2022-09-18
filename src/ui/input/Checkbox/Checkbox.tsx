import { ChangeEventHandler, FC, PropsWithChildren, useCallback } from "react";
import cn from "classnames";
import { IconContainer, svgs } from "../../icon";
import { ContainerProps } from "../../types";
import cl from "./Checkbox.module.scss";

interface Props extends ContainerProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

export const Checkbox: FC<PropsWithChildren<Props>> = ({
  checked = false,
  onChange,
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
          {checked ? <svgs.CheckboxChecked /> : <svgs.CheckboxUnchecked />}
        </IconContainer>
        <input type="checkbox" checked={checked} onChange={handleChange} />
      </span>
      <span>{children}</span>
    </label>
  );
};
