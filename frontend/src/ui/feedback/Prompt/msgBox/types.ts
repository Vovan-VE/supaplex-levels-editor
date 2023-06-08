import { ReactElement, ReactNode } from "react";
import { ButtonProps } from "ui/button";
import { BaseOptions } from "../ask/internal";
import { RenderPromptProps } from "../renderPrompt";

export interface MsgBoxButtonDefaultProps extends Omit<ButtonProps, "onClick"> {
  text?: ReactNode;
}

export interface MsgBoxButtonRenderProps
  extends Omit<RenderPromptProps<void>, "show" | "onSubmit"> {
  defaults: (props?: MsgBoxButtonDefaultProps) => ReactElement;
}

export interface MsgBoxButtonRender {
  (props: MsgBoxButtonRenderProps): ReactElement;
}

export interface MsgBoxOptions extends BaseOptions {
  button?: MsgBoxButtonRender | MsgBoxButtonDefaultProps;
}
