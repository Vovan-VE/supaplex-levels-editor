import {
  ChangeEvent,
  FocusEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useIsChanged } from "utils/react";

interface Options<V> {
  value?: V;
  onChange?: (value: V, e: ChangeEvent<HTMLInputElement>) => void;
  onChangeEnd?: (value: V) => void;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  debounceTimeout?: number;
}

type TimeoutId = ReturnType<typeof setTimeout>;
const resetT = (prev: TimeoutId | null): null => {
  if (prev) clearTimeout(prev);
  return null;
};

/**
 * triggers `onChangeEnd` with debounce when typing finished and right with
 * `onBlur`.
 */
export const useInputDebounce = <V>({
  value,
  onChange,
  onChangeEnd,
  onBlur,
  debounceTimeout = 750,
}: Options<V>) => {
  const [input, setInput] = useState(value);
  const isValueChanged = useIsChanged(value);

  const [, setT] = useState<TimeoutId | null>(null);
  useEffect(() => () => setT(resetT), []);

  if (isValueChanged) {
    setT(resetT);
    setInput(value);
  }

  const refChangeEnd = useRef(onChangeEnd);
  useEffect(() => {
    refChangeEnd.current = onChangeEnd;
  }, [onChangeEnd]);

  const handleChange = useCallback(
    (value: V, e: ChangeEvent<HTMLInputElement>) => {
      setInput(value);
      setT((prev) => {
        if (prev) clearTimeout(prev);
        return setTimeout(() => {
          refChangeEnd.current?.(value);
        }, debounceTimeout);
      });
      onChange?.(value, e);
    },
    [onChange, debounceTimeout],
  );

  const inputIfDiffers = Object.is(input, value) ? undefined : input;
  const handleBlur = useCallback<FocusEventHandler<HTMLInputElement>>(
    (e) => {
      setT(resetT);
      if (inputIfDiffers !== undefined) {
        refChangeEnd.current?.(inputIfDiffers);
      }
      onBlur?.(e);
    },
    [onBlur, inputIfDiffers],
  );

  return {
    value: input !== undefined ? input : value,
    onChange: handleChange,
    onBlur: handleBlur,
  } as const;
};
