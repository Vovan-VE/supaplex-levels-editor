import { ReactNode } from "react";
import { Trans } from "i18n/Trans";
import { Button } from "ui/button";
import { ColorType } from "ui/types";
import { Dialog } from "../../Dialog";
import { renderPrompt } from "../renderPrompt";
import {
  AskButtonsDefaultProps,
  AskButtonsRenderProps,
  AskFunction,
  AskOptions,
} from "./types";

const createDefaultButtonsRenderer =
  (onOk: () => void, onCancel: () => void) =>
  ({ ok, okText, cancel, cancelText }: AskButtonsDefaultProps = {}) => (
    <>
      <Button
        autoFocus
        uiColor={ColorType.SUCCESS}
        {...ok}
        onClick={
          ok?.onClick
            ? (e) => {
                ok.onClick!(e);
                onOk();
              }
            : onOk
        }
      >
        {okText ?? <Trans i18nKey="main:common.buttons.OK" />}
      </Button>
      <Button {...cancel} onClick={onCancel}>
        {cancelText ?? <Trans i18nKey="main:common.buttons.Cancel" />}
      </Button>
    </>
  );

function ask_<V = true, P = object>(
  content: ReactNode,
  { buttons, buttonsProps, ...options }: AskOptions<V, P> = {},
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
                ...buttonsProps,
                onSubmit,
                onCancel,
                defaults: defaultButtonsRenderer,
              } as AskButtonsRenderProps<V> & P)
            : defaultButtonsRenderer(buttons)
        }
        onClose={onCancel}
      >
        {content}
      </Dialog>
    );
  });
}

export const ask: AskFunction = ask_;
