import { FC, PropsWithChildren } from "react";
import cl from "./Separator.module.scss";

export const Separator: FC<PropsWithChildren<{}>> = ({ children }) => (
  <div className={cl.root}>{children}</div>
);
