import { Trans } from "i18n/Trans";
import { HK_EDIT_REPLACE } from "models/ui/hotkeys-defined";
import { svgs } from "ui/icon";
import { SelectionEditor } from "./_types";
import { ReplaceEditor } from "./ReplaceEditor";

export const replace: SelectionEditor = {
  title: <Trans i18nKey="main:selectionEditors.replace.Title" />,
  icon: <svgs.Replace />,
  Component: ReplaceEditor,
  hotkeys: HK_EDIT_REPLACE,
};
