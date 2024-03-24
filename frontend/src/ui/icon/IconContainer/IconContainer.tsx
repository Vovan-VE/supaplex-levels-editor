import cn from "classnames";
import { FC, HTMLAttributes, ReactElement } from "react";
import { IconStackType } from "./IconStackType";
import cl from "./IconContainer.module.scss";

export type IconStackItem = [IconStackType, ReactElement];
export type IconStack = readonly IconStackItem[];

const CL_WITH_STACK_TYPE: Record<IconStackType, string> = {
  [IconStackType.Index]: cl._withStackIndex,
};
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
  <i
    {...rest}
    className={cn(
      cl.root,
      stack?.map(([type]) => CL_WITH_STACK_TYPE[type]),
      className,
    )}
  >
    {children}
    {stack?.map(([type, icon], i) => (
      <span key={i} className={CL_STACK_TYPE[type]}>
        {icon}
      </span>
    ))}
  </i>
);
