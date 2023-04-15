import { FC } from "react";
import { svgs } from "ui/icon";
import { SelectionEditor, SelectionEditorProps } from "./_types";

const ReplaceEditor: FC<SelectionEditorProps> = ({ onSubmit }) => (
  <div>...</div>
);

export const replace: SelectionEditor = {
  title: "Replace",
  icon: <svgs.Replace />,
  Component: ReplaceEditor,
};
