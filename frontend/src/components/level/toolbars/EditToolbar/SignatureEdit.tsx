import { useStore } from "effector-react";
import {
  ChangeEventHandler,
  FC,
  FormEvent,
  useCallback,
  useState,
} from "react";
import { getDriverFormat, levelSupportSignature } from "drivers";
import {
  $currentDriverFormat,
  $currentDriverName,
  $currentLevelUndoQueue,
  updateCurrentLevel,
} from "models/levelsets";
import { showToastError } from "models/ui/toasts";
import { Button } from "ui/button";
import { Dialog, renderPrompt, RenderPromptProps } from "ui/feedback";
import { Field, Textarea } from "ui/input";
import { ColorType } from "ui/types";
import cl from "./SignatureEdit.module.scss";

interface Props extends RenderPromptProps<undefined> {}

const SignatureEdit: FC<Props> = ({ show, onSubmit, onCancel }) => {
  const driverName = useStore($currentDriverName)!;
  const { signatureMaxLength } = getDriverFormat(
    driverName,
    useStore($currentDriverFormat)!,
  )!;
  const level = useStore($currentLevelUndoQueue)!.current;
  const [signature, setSignature] = useState(() =>
    levelSupportSignature(level) ? level.signatureString : "",
  );

  const handleChange = useCallback<ChangeEventHandler<HTMLTextAreaElement>>(
    ({ target: { value } }) => setSignature(value),
    [],
  );

  const error =
    signatureMaxLength !== undefined && signature.length > signatureMaxLength
      ? `Max length is ${signatureMaxLength}`
      : null;

  const hasError = error !== null;
  const handleOk = useCallback(() => {
    if (hasError || !levelSupportSignature(level)) {
      return;
    }
    try {
      const next = level.setSignature(signature);
      updateCurrentLevel(next);
      onSubmit();
    } catch (e) {
      showToastError(e);
    }
  }, [hasError, signature, level, onSubmit]);

  return (
    <Dialog
      title="Level signature"
      open={show}
      wrapForm={{
        onSubmit: (e: FormEvent) => {
          e.preventDefault();
          handleOk();
        },
      }}
      buttons={
        <>
          <Button uiColor={ColorType.SUCCESS} type="submit" disabled={hasError}>
            OK
          </Button>
          <Button type="button" onClick={onCancel}>
            Cancel
          </Button>
        </>
      }
      onClose={onCancel}
    >
      <Field error={error}>
        <Textarea
          value={signature}
          maxLength={signatureMaxLength}
          onChange={handleChange}
          className={cl.signature}
        />
      </Field>
    </Dialog>
  );
};

export const openSignatureEdit = () =>
  renderPrompt<undefined>((props) => <SignatureEdit {...props} />);
