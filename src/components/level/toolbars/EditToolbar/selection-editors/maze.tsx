import { FC } from "react";
import { svgs } from "ui/icon";
import { SelectionEditor, SelectionEditorProps } from "./_types";

const MazeEditor: FC<SelectionEditorProps> = ({ onSubmit }) => <div>...</div>;

export const maze: SelectionEditor = {
  title: "Maze",
  icon: <svgs.Maze />,
  cannotWorkWhy: (s) =>
    s.width < 5 || s.height < 5 ? <>at least 5x5</> : null,
  Component: MazeEditor,
};
