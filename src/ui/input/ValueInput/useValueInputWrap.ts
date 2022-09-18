import {
  ChangeEvent,
  FocusEvent,
  ForwardedRef,
  RefAttributes,
  useCallback,
  useEffect,
  useState,
} from "react";
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
  const [isFocused, setIsFocused] = useState(false);
  const [ownValue, setOwnValue] = useState(
    value === undefined ? emptyValue : value,
  );
  const [input, setInput] = useState(formatValue(ownValue));

  const updateInput = useCallback(
    (value: V) => {
      const string = formatValue(value);
      // REFACT: useless condition
      // if (string !== input) {
      setInput(string);
      // }
    },
    [formatValue],
  );

  useEffect(() => {
    if (undefined !== value) {
      setOwnValue(value);
      if (!isFocused) {
        updateInput(value);
      }
    }
  }, [value, updateInput, isFocused]);

  // update input on format change (by locale or props)
  useEffect(() => {
    // REFACT: does it work without warning?
    setOwnValue((ownValue) => {
      setInput(formatValue(ownValue));
      return ownValue;
    });
  }, [formatValue]);

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
      setIsFocused(true);
      onFocus?.(e);
    },
    [onFocus],
  );

  const handleBlur = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      // const string = ownValue === null ? '' : nFormat.format(ownValue);
      // if (string !== input) {
      //   setInput(string);
      // }
      setIsFocused(false);
      updateInput(ownValue);

      onBlur?.(e);
    },
    [ownValue, onBlur, updateInput],
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
