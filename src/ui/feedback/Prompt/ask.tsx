import { ReactNode } from "react";
import { Button } from "ui/button";
import { ColorType } from "ui/types";
import { Dialog, DialogProps } from "../Dialog";
import { renderPrompt } from "./renderPrompt";

interface Options extends Omit<DialogProps, "open" | "buttons" | "onClose"> {}

export const ask = (content: ReactNode, options: Options = {}) =>
  renderPrompt(({ show, onSubmit, onCancel }) => (
    <Dialog
      {...options}
      open={show}
      buttons={
        <>
          <Button
            uiColor={ColorType.SUCCESS}
            onClick={() => onSubmit()}
            autoFocus
          >
            OK
          </Button>
          <Button onClick={onCancel}>Cancel</Button>
        </>
      }
      onClose={onCancel}
    >
      {content}
    </Dialog>
  ));
