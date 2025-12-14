import cn from "classnames";
import { FC, PropsWithChildren, RefAttributes } from "react";
import { ContainerProps } from "../../types";
import cl from "./Toolbar.module.scss";

interface Props extends ContainerProps, RefAttributes<HTMLDivElement> {
  withBG?: boolean;
  isMenu?: boolean;
}

export const Toolbar: FC<PropsWithChildren<Props>> = ({
  ref,
  withBG = true,
  isMenu = false,
  className,
  children,
  ...rest
}) => (
  <div
    {...rest}
    ref={ref}
    className={cn(cl.root, withBG && cl._withBG, isMenu && cl._menu, className)}
  >
    {children}
  </div>
);

export const ToolbarSeparator: FC<
  ContainerProps & RefAttributes<HTMLSpanElement>
> = ({ ref, className, ...rest }) => (
  <span {...rest} ref={ref} className={cn(cl.separator, className)} />
);
