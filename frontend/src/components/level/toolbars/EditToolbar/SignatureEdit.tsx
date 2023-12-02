import { useStore } from "effector-react";
import {
  ChangeEventHandler,
  FC,
  FormEventHandler,
  useCallback,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
      ? t("main:validate.StrMaxLen", { max: signatureMaxLength })
      : null;

  const hasError = Boolean(demoTextError || signatureError);
  const handleOk = useCallback<FormEventHandler>(
    (e) => {
      e.preventDefault();
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
    },
    [hasError, demo, signature, level, onSubmit],
  );

  return (
    <Dialog
      title={t("main:demoEdit.DialogTitle")}
      open={show}
      wrapForm={{ onSubmit: handleOk }}
      buttons={
        <>
          <Button uiColor={ColorType.SUCCESS} type="submit" disabled={hasError}>
            {t("main:common.buttons.OK")}
          </Button>
          <Button type="button" onClick={onCancel}>
            {t("main:common.buttons.Cancel")}
          </Button>
        </>
      }
      onClose={onCancel}
    >
      {levelSupportsDemo(level) && demoToText && (
        <>
          <Field
            label={t("main:demoEdit.DemoText")}
            help={
              handleDemoHelp && (
                <TextButton icon={<svgs.Info />} onClick={handleDemoHelp}>
                  {t("main:common.buttons.Help")}
                </TextButton>
              )
            }
            error={demoTextError?.message}
            className={cl.demoField}
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
        <Field label={t("main:demoEdit.Signature")} error={signatureError}>
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
