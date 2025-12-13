import { ReactElement } from "react";
import { DenyOverlappedKeys } from "@cubux/types";
import { IconStack } from "../../icon";
import { ColorType } from "../../types";
import { AttributesProps } from "./attributes";

export const enum IconPosition {
  START = "start",
  END = "end",
}

export interface OwnProps {
  icon?: ReactElement;
  iconPosition?: IconPosition;
  iconStack?: IconStack;
  loading?: boolean;
  uiColor?: ColorType;
}

export type ButtonCoreProps = DenyOverlappedKeys<AttributesProps, OwnProps>;
