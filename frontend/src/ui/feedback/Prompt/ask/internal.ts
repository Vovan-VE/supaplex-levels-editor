import { DialogProps } from "../../Dialog";

export type BaseOptions = Omit<DialogProps, "open" | "buttons" | "onClose">;
