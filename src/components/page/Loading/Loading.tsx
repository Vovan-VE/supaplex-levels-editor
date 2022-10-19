import { FC, ReactNode } from "react";
import cn from "classnames";
import { Spinner } from "ui/feedback";
import { ContainerProps } from "ui/types";
import cl from "./Loading.module.scss";

interface Props extends ContainerProps {
  message?: ReactNode;
}

export const Loading: FC<Props> = ({ message, className, ...rest }) => (
  <div {...rest} className={cn(cl.root, className)}>
    <Spinner inline /> {message ?? "Loading..."}
  </div>
);
