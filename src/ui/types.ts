import { HTMLAttributes } from "react";

export const enum ColorType {
  DEFAULT = "",
  MUTE = "m",
  PRIMARY = "p",
  SUCCESS = "s",
  WARN = "w",
  DANGER = "d",
}

export interface ContainerProps
  extends Pick<
    HTMLAttributes<any>,
    "className" | "draggable" | "style" | "tabIndex" | "role"
  > {}
