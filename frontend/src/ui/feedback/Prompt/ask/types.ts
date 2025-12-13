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

export interface AskButtonsRender<V, P = object> {
  (props: AskButtonsRenderProps<V> & P): ReactElement | null;
}

export interface AskOptions<V = true, P = object> extends BaseOptions {
  buttons?: AskButtonsRender<V, P> | AskButtonsDefaultProps;
  buttonsProps?: P;
}

interface DefaultOpts extends BaseOptions {
  buttons?: AskButtonsDefaultProps;
}
interface CustomOpts<V, P = object> extends BaseOptions {
  buttons: AskButtonsRender<V, P>;
  buttonsProps?: P;
}

export interface AskFunction {
  <V, P = object>(
    content: ReactElement | string,
    o: CustomOpts<V, P>,
  ): Promise<V | undefined>;
  (content: ReactElement | string, o?: DefaultOpts): Promise<true | undefined>;
}
