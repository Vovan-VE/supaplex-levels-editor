import { forwardRef, PropsWithChildren } from "react";
import cn from "classnames";
import { ContainerProps } from "../../types";
import cl from "./Toolbar.module.scss";

interface Props extends ContainerProps {
  withBG?: boolean;
}

export const Toolbar = forwardRef<HTMLDivElement, PropsWithChildren<Props>>(
  ({ withBG = true, className, children, ...rest }, ref) => (
    <div
      {...rest}
      ref={ref}
      className={cn(cl.root, withBG && cl._withBG, className)}
    >
      {children}
    </div>
  ),
);

export const ToolbarSeparator = forwardRef<HTMLSpanElement, ContainerProps>(
  ({ className, ...rest }, ref) => (
    <span {...rest} ref={ref} className={cn(cl.separator, className)} />
  ),
);
