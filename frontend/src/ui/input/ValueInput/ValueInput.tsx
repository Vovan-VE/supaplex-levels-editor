import { Input } from "../Input";
import { ValueInputWrapProps } from "./types";
import { useValueInputWrap } from "./useValueInputWrap";

export const ValueInput = <V,>({ ref, ...props }: ValueInputWrapProps<V>) => (
  <Input ref={ref} {...useValueInputWrap(props)} />
);
