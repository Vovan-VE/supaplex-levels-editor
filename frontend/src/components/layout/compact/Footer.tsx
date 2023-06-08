import { FC } from "react";
import { HoveredCell } from "components/level";
import cl from "./Footer.module.scss";

export const Footer: FC = () => {
  return <HoveredCell className={cl.hoveredCell} />;
};
