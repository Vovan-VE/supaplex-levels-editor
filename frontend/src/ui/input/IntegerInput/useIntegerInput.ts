import { createValueInputHook } from "../ValueInput";

const re = /^[-+]?\d+$/;

export const useIntegerInput = createValueInputHook<number | null>({
  emptyValue: null,
  formatValue: (v) => (v === null ? "" : Number(v).toFixed(0)),
  parseInput: (s) => {
    const m = s.match(re);
    if (m) {
      const n = parseInt(m[0]);
      if (Number.isInteger(n)) {
        return n;
      }
    }
    return null;
  },
});
