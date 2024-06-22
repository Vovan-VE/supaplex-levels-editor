// https://github.com/clauderic/dnd-kit/issues/604
export type ValidKey = string;
export const isValidKey = (v: unknown): v is ValidKey => typeof v === "string";

export type SortDirection = "H" | "V";
