import { ReactNode } from "react";
import { Button } from "ui/button";
import { ColorType } from "ui/types";
import { Dialog } from "../../Dialog";
import { renderPrompt } from "../renderPrompt";
import { AskButtonsDefaultProps, AskOptions } from "./types";

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

export function ask<V = true>(
  content: ReactNode,
  { buttons, ...options }: AskOptions<V> = {},
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
