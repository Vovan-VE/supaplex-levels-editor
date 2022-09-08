import { ReactNode } from "react";
import { Button } from "ui/button";
import { ColorType } from "ui/types";
import { Dialog } from "../../Dialog";
import { renderPrompt } from "../renderPrompt";
import { MsgBoxButtonDefaultProps, MsgBoxOptions } from "./types";

const createDefaultButtonsRenderer =
  (onOk: () => void) =>
  ({ text, ...props }: MsgBoxButtonDefaultProps = {}) =>
    (
      <Button autoFocus uiColor={ColorType.SUCCESS} {...props} onClick={onOk}>
        {text ?? "OK"}
      </Button>
    );

export function msgBox(
  content: ReactNode,
  { button, ...options }: MsgBoxOptions = {},
): Promise<void> {
  return renderPrompt<never>(({ show, onCancel }) => {
    const defaultButtonsRenderer = createDefaultButtonsRenderer(onCancel);

    return (
      <Dialog
        {...options}
        open={show}
        buttons={
          typeof button === "function"
            ? button({
                onCancel,
                defaults: defaultButtonsRenderer,
              })
            : defaultButtonsRenderer(button)
        }
        onClose={onCancel}
      >
        {content}
      </Dialog>
    );
  });
}
