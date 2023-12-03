import { FC, ReactElement, ReactNode } from "react";
import { ILevelRegion } from "drivers";
import { HotKeyShortcuts } from "models/ui/hotkeys";
import { DialogSize } from "ui/feedback";
import { IBounds } from "utils/rect";

export interface SelectionEditorProps {
  region: ILevelRegion;
  onSubmit: (region: ILevelRegion) => void;
  onCancel: () => void;
}
export type SelectionEditorFn = (r: ILevelRegion) => ILevelRegion | null;

export interface SelectionEditor {
  title: ReactNode;
  icon?: ReactElement;
  cannotWorkWhy?: (selectionSize: IBounds) => ReactElement | null;
  Component?: FC<SelectionEditorProps>;
  instant?: SelectionEditorFn;
  hotkeys?: HotKeyShortcuts;
  dialogSize?: DialogSize;
}
