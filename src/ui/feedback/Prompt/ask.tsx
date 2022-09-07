import { ReactElement, ReactNode } from "react";
import { Button, ButtonProps } from "ui/button";
import { ColorType } from "ui/types";
import { Dialog, DialogProps } from "../Dialog";
import { renderPrompt, RenderPromptProps } from "./renderPrompt";

export interface AskButtonsDefaultProps {
  ok?: Omit<ButtonProps, "onClick">;
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

const createDefaultButtonsRenderer =
  (onOk: () => void, onCancel: () => void) =>
  ({ ok, okText, cancel, cancelText }: AskButtonsDefaultProps = {}) =>
    (
      <>
        <Button autoFocus uiColor={ColorType.SUCCESS} {...ok} onClick={onOk}>
          {okText ?? "OK"}
        </Button>
        <Button {...cancel} onClick={onCancel}>
          {cancelText ?? "Cancel"}
        </Button>
      </>
    );

interface Options<V> extends Omit<DialogProps, "open" | "buttons" | "onClose"> {
  buttons?: AskButtonsRender<V> | AskButtonsDefaultProps;
}

export function ask<V = true>(
  content: ReactNode,
  { buttons, ...options }: Options<V> = {},
) {
  return renderPrompt(({ show, onSubmit, onCancel }) => {
    const defaultButtonsRenderer = createDefaultButtonsRenderer(
      () => onSubmit(),
      onCancel,
    );

    return (
      <Dialog
        {...options}
        open={show}
        buttons={
          typeof buttons === "function"
            ? buttons({
                onSubmit: onSubmit as any,
                onCancel,
                defaults: defaultButtonsRenderer,
              })
            : defaultButtonsRenderer(buttons)
        }
        onClose={onCancel}
      >
        {content}
      </Dialog>
    );
  });
}
