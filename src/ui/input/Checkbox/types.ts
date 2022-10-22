import { PropsWithChildren } from "react";
import { ContainerProps } from "../../types";

export interface CheckboxCoreProps extends PropsWithChildren<ContainerProps> {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}
