import { useStore } from "effector-react";
import {
  ChangeEventHandler,
  FC,
  FormEvent,
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  getDriver,
  getDriverFormat,
  levelSupportsDemo,
  levelSupportSignature,
} from "drivers";
import {
  $currentDriverFormat,
  $currentDriverName,
  $currentLevelUndoQueue,
  updateCurrentLevel,
} from "models/levelsets";
import { showToastError } from "models/ui/toasts";
import { Button, TextButton } from "ui/button";
import { Dialog, msgBox, renderPrompt, RenderPromptProps } from "ui/feedback";
import { svgs } from "ui/icon";
import { Field, Textarea } from "ui/input";
import { ColorType } from "ui/types";
import cl from "./SignatureEdit.module.scss";

interface Props extends RenderPromptProps<undefined> {}

type _TC = ChangeEventHandler<HTMLTextAreaElement>;

const SignatureEdit: FC<Props> = ({ show, onSubmit, onCancel }) => {
  const driverName = useStore($currentDriverName)!;
  const { DemoToTextConfig, DemoToTextHelp, demoToText, demoFromText } =
    getDriver(driverName)!;
  const { signatureMaxLength } = getDriverFormat(
    driverName,
    useStore($currentDriverFormat)!,
  )!;
  const level = useStore($currentLevelUndoQueue)!.current;
  const [demo, setDemo] = useState(() =>
    levelSupportsDemo(level) ? level.demo : null,
  );
  const [demoTextOptions, setDemoTextOptions] = useState<object>({});
  const [demoText, setDemoText] = useState(() =>
    demoToText ? demoToText(demo) : "",
  );
  const [demoTextError, setDemoTextError] = useState<Error | null>(null);
  const [signature, setSignature] = useState(() =>
    levelSupportSignature(level) ? level.signatureString : "",
  );

  const handleDemoChange = useCallback<_TC>(
    ({ target: { value } }) => {
      if (demoFromText) {
        setDemoText(value);
        try {
          setDemo(demoFromText(value));
          setDemoTextError(null);
        } catch (e) {
          if (e instanceof Error) {
            setDemoTextError(e);
          } else {
            throw e;
          }
        }
      }
    },
    [demoFromText],
  );
  const handleDemoTextOptionsChange = useCallback(
    (options: object) => {
      if (demoToText) {
        setDemoTextOptions(options);
        setDemoText(demoToText(demo, options));
      }
    },
    [demo, demoToText],
  );
  const handleSignatureChange = useCallback<_TC>(
    (e) => setSignature(e.target.value),
    [],
  );
  const handleDemoHelp = useMemo(
    () => DemoToTextHelp && (() => msgBox(<DemoToTextHelp />)),
    [DemoToTextHelp],
  );

  const signatureError =
    signatureMaxLength !== undefined && signature.length > signatureMaxLength
      ? `Max length is ${signatureMaxLength}`
      : null;

  const hasError = Boolean(demoTextError || signatureError);
  const handleOk = useCallback(() => {
    if (hasError || !levelSupportsDemo(level)) {
      return;
    }
    try {
      let next = level.setDemo(demo);
      if (levelSupportSignature(next)) {
        next = next.setSignature(signature);
      }
      updateCurrentLevel(next);
      onSubmit();
    } catch (e) {
      showToastError(e);
    }
  }, [hasError, demo, signature, level, onSubmit]);

  return (
    <Dialog
      title="Edit demo"
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
      {levelSupportsDemo(level) && demoToText && (
        <>
          <Field
            label="Demo text representation"
            help={
              handleDemoHelp && (
                <TextButton icon={<svgs.Info />} onClick={handleDemoHelp}>
                  Help
                </TextButton>
              )
            }
            error={demoTextError?.message}
          >
            <Textarea
              value={demoText}
              onChange={handleDemoChange}
              className={cl.demoText}
            />
          </Field>
          {DemoToTextConfig && (
            <DemoToTextConfig
              options={demoTextOptions}
              onChange={handleDemoTextOptionsChange}
            />
          )}
        </>
      )}
      {levelSupportSignature(level) && (
        <Field label="Signature" error={signatureError}>
          <Textarea
            value={signature}
            maxLength={signatureMaxLength}
            onChange={handleSignatureChange}
            className={cl.signature}
          />
        </Field>
      )}
    </Dialog>
  );
};

export const openSignatureEdit = () =>
  renderPrompt<undefined>((props) => <SignatureEdit {...props} />);
