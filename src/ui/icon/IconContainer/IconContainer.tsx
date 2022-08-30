import { FC, HTMLAttributes } from "react";
import cn from "classnames";
import cl from "./IconContainer.module.scss";

interface Props extends HTMLAttributes<HTMLElement> {}

export const IconContainer: FC<Props> = ({ className, children, ...rest }) => (
  <i {...rest} className={cn(cl.root, className)}>
    {children}
  </i>
);
