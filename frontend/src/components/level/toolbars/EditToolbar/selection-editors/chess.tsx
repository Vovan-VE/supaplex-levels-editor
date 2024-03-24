import { Trans } from "i18n/Trans";
import { HK_EDIT_CHESS } from "models/ui/hotkeys-defined";
import { svgs } from "ui/icon";
import { SelectionEditor } from "./_types";
import { ChessEditor } from "./ChessEditor";

export const chess: SelectionEditor = {
  title: <Trans i18nKey="main:selectionEditors.chess.Title" />,
  icon: <svgs.Chess />,
  cannotWorkWhy: (s) =>
    s.width < 2 && s.height < 2 ? (
      <Trans i18nKey="main:selectionEditors.chess.MinSizeRequire" />
    ) : null,
  Component: ChessEditor,
  hotkeys: HK_EDIT_CHESS,
};
