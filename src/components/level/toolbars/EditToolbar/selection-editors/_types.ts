import { FC, ReactElement } from "react";
import { ILevelRegion } from "drivers";
import { IBounds } from "utils/rect";

export interface SelectionEditorProps {
  region: ILevelRegion;
  onSubmit: (region: ILevelRegion) => void;
}
export type SelectionEditorFn = (r: ILevelRegion) => ILevelRegion | null;

export interface SelectionEditor {
  title: string;
  icon?: ReactElement;
  cannotWorkWhy?: (selectionSize: IBounds) => ReactElement | null;
  Component?: FC<SelectionEditorProps>;
  instant?: SelectionEditorFn;
  // TODO: hotkeys?: ;
}
