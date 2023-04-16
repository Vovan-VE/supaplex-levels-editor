import { FC, ReactElement } from "react";
import { ILevelRegion } from "drivers";
import { DialogSize } from "ui/feedback";
import { IBounds } from "utils/rect";

export interface SelectionEditorProps {
  region: ILevelRegion;
  onSubmit: (region: ILevelRegion) => void;
  onCancel: () => void;
}
export type SelectionEditorFn = (r: ILevelRegion) => ILevelRegion | null;

export interface SelectionEditor {
  title: string;
  icon?: ReactElement;
  cannotWorkWhy?: (selectionSize: IBounds) => ReactElement | null;
  Component?: FC<SelectionEditorProps>;
  instant?: SelectionEditorFn;
  // TODO: hotkeys?: ;
  dialogSize?: DialogSize;
}
