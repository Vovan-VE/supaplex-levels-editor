import { FC, HTMLAttributes, ReactElement } from "react";
import cn from "classnames";
import cl from "./IconContainer.module.scss";

export const enum IconStackType {
  Index = "i",
}
export type IconStackItem = [IconStackType, ReactElement];
export type IconStack = readonly IconStackItem[];

const CL_STACK_TYPE: Record<IconStackType, string> = {
  [IconStackType.Index]: cl.stackIndex,
};

interface Props extends HTMLAttributes<HTMLElement> {
  stack?: IconStack;
}

export const IconContainer: FC<Props> = ({
  stack,
  className,
  children,
  ...rest
}) => (
  <i {...rest} className={cn(cl.root, className)}>
    {children}
    {stack?.map(([type, icon], i) => (
      <span key={i} className={CL_STACK_TYPE[type]}>
        {icon}
      </span>
    ))}
  </i>
);
