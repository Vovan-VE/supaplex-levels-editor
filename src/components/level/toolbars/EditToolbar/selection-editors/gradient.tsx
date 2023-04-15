import { FC } from "react";
import { svgs } from "ui/icon";
import { SelectionEditor, SelectionEditorProps } from "./_types";

const GradientEditor: FC<SelectionEditorProps> = ({ onSubmit }) => (
  <div>...</div>
);

export const gradient: SelectionEditor = {
  title: "Gradient",
  // TODO: icon
  icon: <svgs.Pencil />,
  Component: GradientEditor,
};
