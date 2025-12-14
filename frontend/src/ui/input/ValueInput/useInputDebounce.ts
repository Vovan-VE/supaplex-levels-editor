import {
  ChangeEvent,
  FocusEventHandler,
  useCallback,
  useEffect,
  useReducer,
  useRef,
} from "react";

interface Options<V> {
  value?: V;
  onChange?: (value: V, e: ChangeEvent<HTMLInputElement>) => void;
  onChangeEnd?: (value: V) => void;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  debounceTimeout?: number;
}

type TimeoutId = ReturnType<typeof setTimeout>;

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
  const latestV = useRef<V>(undefined);
  useEffect(() => {
    if (value !== undefined) {
      latestV.current = undefined;
    }
  }, [value]);

  const refChangeEnd = useRef(onChangeEnd);
  useEffect(() => {
    refChangeEnd.current = onChangeEnd;
  }, [onChangeEnd]);

  const flushRef = useRef(() => {
    if (latestV.current !== undefined) {
      refChangeEnd.current?.(latestV.current);
      latestV.current = undefined;
    }
  });

  const [, setT] = useReducer(
    (prev: TimeoutId | null, next: TimeoutId | null) => {
      if (prev) clearTimeout(prev);
      return next;
    },
    null,
  );
  useEffect(() => () => setT(null), []);

  const handleChange = useCallback(
    (value: V, e: ChangeEvent<HTMLInputElement>) => {
      latestV.current = value;
      // if (debounceTimeout > 0) {
      setT(setTimeout(flushRef.current, debounceTimeout));
      // }
      // or fire it first and check `e.isDefaultPrevented()` and/or
      // `e.isPropagationStopped()`? Ignore cancelled input.
      onChange?.(value, e);
    },
    [onChange, debounceTimeout],
  );

  const handleBlur = useCallback<FocusEventHandler<HTMLInputElement>>(
    (e) => {
      setT(null);
      flushRef.current();
      onBlur?.(e);
    },
    [onBlur],
  );

  return {
    get value() {
      return latestV.current !== undefined ? latestV.current : value;
    },
    onChange: handleChange,
    onBlur: handleBlur,
  } as const;
};
