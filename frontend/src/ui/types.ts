import { HTMLAttributes } from "react";

export const enum ColorType {
  DEFAULT = "",
  MUTE = "m",
  PRIMARY = "p",
  SUCCESS = "s",
  WARN = "w",
  DANGER = "d",
}

export type ContainerProps = Pick<
  HTMLAttributes<unknown>,
  "className" | "draggable" | "style" | "tabIndex" | "role"
>;
