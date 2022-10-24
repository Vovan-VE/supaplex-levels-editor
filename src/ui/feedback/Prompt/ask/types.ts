import { ReactElement, ReactNode } from "react";
import { ButtonProps } from "ui/button";
import { RenderPromptProps } from "../renderPrompt";
import { BaseOptions } from "./internal";

export interface AskButtonsDefaultProps {
  ok?: ButtonProps;
  okText?: ReactNode;
  cancel?: Omit<ButtonProps, "onClick">;
  cancelText?: ReactNode;
}

export interface AskButtonsRenderProps<V>
  extends Omit<RenderPromptProps<V>, "show"> {
  defaults: (props?: AskButtonsDefaultProps) => ReactElement;
}

export interface AskButtonsRender<V> {
  (props: AskButtonsRenderProps<V>): ReactElement;
}

export interface AskOptions<V = true> extends BaseOptions {
  buttons?: AskButtonsRender<V> | AskButtonsDefaultProps;
}
