import { forwardRef } from "react";
import { Input } from "../Input";
import { ValueInputProps } from "../ValueInput";
import { useIntegerInput } from "./useIntegerInput";

export const IntegerInput = forwardRef<
  HTMLInputElement,
  ValueInputProps<number | null>
>((props, ref) => (
  <Input
    type="text"
    inputMode="numeric"
    pattern="\d*"
    autoComplete="off"
    {...useIntegerInput(props, ref)}
  />
));
