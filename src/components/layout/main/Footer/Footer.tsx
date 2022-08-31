import { FC } from "react";
import cn from "classnames";
import { ContainerProps } from "ui/types";
import cl from "./Footer.module.scss";

interface Props extends ContainerProps {}

export const Footer: FC<Props> = ({ className, ...rest }) => (
  <footer {...rest} className={cn(cl.root, className)}>
    footer
  </footer>
);
