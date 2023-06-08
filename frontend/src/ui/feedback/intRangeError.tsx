import { ReactNode } from "react";

export const intRangeError = (
  value: number | null,
  min?: number | null,
  max?: number | null,
): ReactNode => {
  if (value === null) {
    return "Required";
  }
  if (min !== undefined && min !== null && value < min) {
    return (
      <>
        Must be at least <code>{min}</code>.
      </>
    );
  }
  if (max !== undefined && max !== null && value > max) {
    return (
      <>
        Must be up to <code>{max}</code>.
      </>
    );
  }
};
