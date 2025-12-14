import { ChangeEvent, FocusEvent, useCallback, useState } from "react";
import { useIsChanged } from "utils/react";
import { InputProps } from "../Input";
import { ValueInputWrapProps } from "./types";

export const useValueInputWrap = <V>({
  ref,
  value,
  onChange,
  parseInput,
  formatValue,
  emptyValue,
  onFocus,
  onBlur,
  ...rest
}: ValueInputWrapProps<V>): InputProps => {
  const [ownValue, setOwnValue] = useState(
    value === undefined ? emptyValue : value,
  );
  const [input, setInput] = useState(formatValue(ownValue));

  const isValueChanged = useIsChanged(value);
  const isFormatterChanged = useIsChanged(formatValue);
  if (isValueChanged || isFormatterChanged) {
    if (undefined !== value) {
      setOwnValue(value);
    }
  }

  // update input on format change (by locale or props)
  if (isFormatterChanged) {
    setInput(formatValue(ownValue));
  }

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      const value = parseInput(input);
      setInput(input);
      if (value !== ownValue) {
        setOwnValue(value);
        onChange?.(value, e);
      }
    },
    [ownValue, parseInput, onChange],
  );

  const handleFocus = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      // if (undefined !== value) {
      //   setOwnValue(value);
      // }
      onFocus?.(e);
    },
    [onFocus],
  );

  const handleBlur = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      if (undefined !== value) {
        setOwnValue(value);
        setInput(formatValue(value));
      } else {
        setInput(formatValue(ownValue));
      }

      onBlur?.(e);
    },
    [value, formatValue, ownValue, onBlur],
  );

  return {
    ...rest,
    value: input,
    onChange: handleChange,
    onFocus: handleFocus,
    onBlur: handleBlur,
  };
};
