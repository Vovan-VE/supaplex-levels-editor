import { PropsWithChildren } from "react";
import RSelect, {
  components,
  Props as RSelectProps,
  SingleValueProps,
} from "react-select";
import { AnyKey } from "@cubux/types";
import "./Select.scss";

export interface SelectOption<V extends AnyKey> {
  value: V;
  label: string;
  labelSelected?: string;
}

interface Props<V extends AnyKey> extends RSelectProps<SelectOption<V>, false> {
  // options:Options<SelectOption<V>>;
}

export const Select = <V extends AnyKey>(props: Props<V>) => (
  <RSelect
    {...props}
    components={{ SingleValue: SingleValue as any }}
    classNamePrefix="app-react-select"
  />
);

const SingleValue = <V extends AnyKey>({
  children,
  ...props
}: PropsWithChildren<SingleValueProps<SelectOption<V>, false>>) => (
  <components.SingleValue {...props}>
    {props.data.labelSelected ?? children}
  </components.SingleValue>
);
