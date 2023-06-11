import { forwardRef, ReactElement } from "react";
import { Input } from "../Input";
import { ValueInputWrapProps } from "./types";
import { useValueInputWrap } from "./useValueInputWrap";

interface IValueInput {
  <V>(props: ValueInputWrapProps<V>): ReactElement | null;
}

export const ValueInput = forwardRef<
  HTMLInputElement,
  ValueInputWrapProps<any>
>((props, ref) => <Input {...useValueInputWrap(props, ref)} />) as IValueInput;
