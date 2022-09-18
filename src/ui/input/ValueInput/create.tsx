import { ForwardedRef } from "react";
import { ValueInputProps, ValueInputWrap } from "./types";
import { useValueInputWrap } from "./useValueInputWrap";

export const createValueInputHook = <V,>(wrap: ValueInputWrap<V>) =>
  function useValueInputCustom(
    props: ValueInputProps<V>,
    ref?: ForwardedRef<HTMLInputElement>,
  ) {
    return useValueInputWrap({ ...wrap, ...props }, ref);
  };
