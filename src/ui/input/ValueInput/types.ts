import { ChangeEvent } from "react";
import { InputProps } from "../Input";

export interface ValueInputWrap<V> {
  parseInput: (input: string) => V;
  formatValue: (value: V) => string;
  emptyValue: V;
}

export interface ValueInputProps<V>
  extends Omit<InputProps, "value" | "onChange"> {
  value?: V | undefined;
  onChange?: (value: V, e: ChangeEvent<HTMLInputElement>) => void;
}

export interface ValueInputWrapProps<V>
  extends ValueInputProps<V>,
    ValueInputWrap<V> {}
