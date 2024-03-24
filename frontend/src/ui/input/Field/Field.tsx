import { FC, PropsWithChildren, ReactHTML, ReactNode } from "react";
import cn from "classnames";
import { ContainerProps } from "ui/types";
import cl from "./Field.module.scss";

interface Props extends ContainerProps {
  label?: ReactNode;
  labelFor?: string;
  labelElement?: keyof ReactHTML;
  labelClassName?: string;
  /**
   * Notice: It has different behaviour when it's absent vs it's set to
   * `undefined`, compared to common JS practice.
   */
  error?: ReactNode;
  help?: ReactNode;
}
const P_ERROR: keyof Props = "error";
const hasOwn = Object.prototype.hasOwnProperty;

export const Field: FC<PropsWithChildren<Props>> = (props) => {
  const {
    label,
    labelFor,
    labelElement: LabelElement = "label",
    labelClassName,
    error,
    help,
    className,
    children,
    ...rest
  } = props;
  const withError = hasOwn.call(props, P_ERROR);

  const control = <div className={cl.control}>{children}</div>;
  const labelClass = cn(cl.label, labelClassName);

  return (
    <div
      {...rest}
      className={cn(
        cl.root,
        className,
        error ? [cl._isError, "input-invalid"] : "input-valid",
        withError || cl._noError,
      )}
    >
      {label ? (
        labelFor ? (
          <>
            <label
              htmlFor={labelFor}
              className={cn(labelClass, cl.labelElement)}
            >
              {label}
            </label>
            {control}
          </>
        ) : (
          <LabelElement
            className={cn(LabelElement === "label" && cl.labelElement)}
          >
            <div className={labelClass}>{label}</div>
            {control}
          </LabelElement>
        )
      ) : (
        control
      )}

      {help && <div className={cl.help}>{help}</div>}
      {withError && <div className={cl.error}>{error}</div>}
    </div>
  );
};
