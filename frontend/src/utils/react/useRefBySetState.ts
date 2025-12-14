import { Dispatch, RefCallback, SetStateAction, useCallback } from "react";

export const useRefBySetState = <T>(
  setState: Dispatch<SetStateAction<T | null>>,
) =>
  useCallback<RefCallback<T>>(
    (v: T) => {
      setState(v);
      return () => {
        setState(null);
      };
    },
    [setState],
  );
