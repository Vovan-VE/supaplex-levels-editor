import { DialogProps } from "../../Dialog";

export interface BaseOptions
  extends Omit<DialogProps, "open" | "buttons" | "onClose"> {}
