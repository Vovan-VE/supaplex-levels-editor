import { Trans } from "i18n/Trans";
import { HK_EDIT_GRADIENT } from "models/ui/hotkeys-defined";
import { svgs } from "ui/icon";
import { SelectionEditor } from "./_types";
import { GradientEditor } from "./GradientEditor";

export const gradient: SelectionEditor = {
  title: <Trans i18nKey="main:selectionEditors.gradient.Title" />,
  icon: <svgs.Gradient />,
  Component: GradientEditor,
  hotkeys: HK_EDIT_GRADIENT,
};
