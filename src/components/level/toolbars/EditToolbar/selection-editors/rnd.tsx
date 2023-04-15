import { FC } from "react";
import { svgs } from "ui/icon";
import { SelectionEditor, SelectionEditorProps } from "./_types";

const RndEditor: FC<SelectionEditorProps> = ({ onSubmit }) => <div>...</div>;

export const rnd: SelectionEditor = {
  title: "Random",
  icon: <svgs.Random />,
  Component: RndEditor,
};
