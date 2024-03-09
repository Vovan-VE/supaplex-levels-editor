import { Trans } from "i18n/Trans";
import { HK_EDIT_RANDOM } from "models/ui/hotkeys-defined";
import { svgs } from "ui/icon";
import { SelectionEditor } from "./_types";
import { RndEditor } from "./RndEditor";

export const rnd: SelectionEditor = {
  title: <Trans i18nKey="main:selectionEditors.rnd.Title" />,
  icon: <svgs.Random />,
  Component: RndEditor,
  hotkeys: HK_EDIT_RANDOM,
};
