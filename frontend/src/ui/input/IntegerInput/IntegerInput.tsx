import { FC } from "react";
import { Input } from "../Input";
import { ValueInputProps } from "../ValueInput";
import { useIntegerInput } from "./useIntegerInput";

export const IntegerInput: FC<ValueInputProps<number | null>> = ({
  ref,
  ...props
}) => (
  <Input
    ref={ref}
    type="text"
    inputMode="numeric"
    pattern="\d*"
    autoComplete="off"
    {...useIntegerInput(props)}
  />
);
