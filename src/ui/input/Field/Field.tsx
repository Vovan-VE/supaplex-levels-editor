import { FC, PropsWithChildren, ReactHTML, ReactNode } from "react";
import cn from "classnames";
import { ContainerProps } from "ui/types";
import cl from "./Field.module.scss";

interface Props extends ContainerProps {
  label?: ReactNode;
  labelFor?: string;
  labelElement?: keyof ReactHTML;
  labelClassName?: string;
  error?: ReactNode;
  help?: ReactNode;
}

export const Field: FC<PropsWithChildren<Props>> = ({
  label,
  labelFor,
  labelElement: LabelElement = "label",
  labelClassName,
  error,
  help,
  className,
  children,
  ...rest
}) => {
  const control = <div className={cl.control}>{children}</div>;
  const labelClass = cn(cl.label, labelClassName);

  return (
    <div
      {...rest}
      className={cn(cl.root, className, Boolean(error) && cl._isError)}
    >
      {label ? (
        labelFor ? (
          <>
            <label htmlFor={labelFor} className={labelClass}>
              {label}
            </label>
            {control}
          </>
        ) : (
          <LabelElement>
            <div className={labelClass}>{label}</div>
            {control}
          </LabelElement>
        )
      ) : (
        control
      )}

      {help && <div className={cl.help}>{help}</div>}
      <div className={cl.error}>{error}</div>
    </div>
  );
};
