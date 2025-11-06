import {
  ChangeEvent,
  FocusEvent,
  ForwardedRef,
  RefAttributes,
  useCallback,
  useState,
} from "react";
import { useIsChanged } from "utils/react";
import { InputProps } from "../Input";
import { ValueInputWrapProps } from "./types";

export const useValueInputWrap = <V>(
  {
    value,
    onChange,
    parseInput,
    formatValue,
    emptyValue,
    onFocus,
    onBlur,
    ...rest
  }: ValueInputWrapProps<V>,
  ref?: ForwardedRef<HTMLInputElement>,
): InputProps & RefAttributes<HTMLInputElement> => {
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
    ref,
    value: input,
    onChange: handleChange,
    onFocus: handleFocus,
    onBlur: handleBlur,
  };
};
