import { forwardRef } from "react";
import { Input } from "../Input";
import { createValueInputHook, ValueInputProps } from "../ValueInput";

const re = /^[-+]?\d+$/;

export const useIntegerInput = createValueInputHook<number | null>({
  emptyValue: null,
  formatValue: (v) => (v === null ? "" : Number(v).toFixed(0)),
  parseInput: (s) => {
    const m = s.match(re);
    if (m) {
      const n = parseInt(m[0]);
      if (!isNaN(n) && n === ~~n) {
        return n;
      }
    }
    return null;
  },
});

export const IntegerInput = forwardRef<
  HTMLInputElement,
  ValueInputProps<number | null>
>((props, ref) => (
  <Input
    type="text"
    inputMode="numeric"
    pattern="\d*"
    autoComplete="off"
    {...useIntegerInput(props, ref)}
  />
));
