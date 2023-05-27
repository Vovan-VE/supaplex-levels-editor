import { ReactNode } from "react";
import { Button, ButtonProps } from "ui/button";
import { ColorType } from "ui/types";
import { AskButtonsRender } from "./types";

interface YesNoOptions {
  yes?: ButtonProps;
  yesText?: ReactNode;
  no?: ButtonProps;
  noText?: ReactNode;
  cancel?: Omit<ButtonProps, "onClick">;
  cancelText?: ReactNode;
}

export const YesNoCancel: AskButtonsRender<boolean, YesNoOptions> = ({
  yes,
  yesText,
  no,
  noText,
  cancel,
  cancelText,
  onSubmit,
  onCancel,
}) => (
  <>
    <Button
      autoFocus
      uiColor={ColorType.SUCCESS}
      {...yes}
      onClick={
        yes?.onClick
          ? (e) => {
              yes.onClick!(e);
              onSubmit(true);
            }
          : () => onSubmit(true)
      }
    >
      {yesText ?? "Yes"}
    </Button>
    <Button
      autoFocus
      uiColor={ColorType.PRIMARY}
      {...no}
      onClick={
        no?.onClick
          ? (e) => {
              no.onClick!(e);
              onSubmit(false);
            }
          : () => onSubmit(false)
      }
    >
      {noText ?? "No"}
    </Button>
    <Button uiColor={ColorType.MUTE} {...cancel} onClick={onCancel}>
      {cancelText ?? "Cancel"}
    </Button>
  </>
);
