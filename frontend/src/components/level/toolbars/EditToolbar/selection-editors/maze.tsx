import { Trans } from "i18n/Trans";
import { HK_EDIT_MAZE } from "models/ui/hotkeys-defined";
import { svgs } from "ui/icon";
import { SelectionEditor } from "./_types";
import { MazeEditor } from "./MazeEditor";

export const maze: SelectionEditor = {
  title: <Trans i18nKey="main:selectionEditors.maze.Title" />,
  icon: <svgs.Maze />,
  cannotWorkWhy: (s) =>
    s.width < 3 || s.height < 3 ? (
      <Trans i18nKey="main:selectionEditors.maze.MinSizeRequire" />
    ) : null,
  Component: MazeEditor,
  hotkeys: HK_EDIT_MAZE,
};
