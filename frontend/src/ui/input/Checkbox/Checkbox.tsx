import { FC } from "react";
import { CheckboxCoreProps } from "./types";
import { CheckboxRender } from "./CheckboxRender";

export const Checkbox: FC<CheckboxCoreProps> = (props) => (
  <CheckboxRender _radio={false} {...props} />
);
