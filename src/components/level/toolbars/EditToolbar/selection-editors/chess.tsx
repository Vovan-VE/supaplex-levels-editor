import { FC } from "react";
import { svgs } from "ui/icon";
import { SelectionEditor, SelectionEditorProps } from "./_types";

const ChessEditor: FC<SelectionEditorProps> = ({ onSubmit }) => <div>...</div>;

export const chess: SelectionEditor = {
  title: "Chess",
  // TODO: icon
  icon: <svgs.Pencil />,
  cannotWorkWhy: (s) =>
    s.width < 2 && s.height < 2 ? <>at least 2 tiles</> : null,
  Component: ChessEditor,
};
