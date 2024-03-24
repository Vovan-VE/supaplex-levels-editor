import { useUnit } from "effector-react";
import {
  ChangeEventHandler,
  FC,
  FormEventHandler,
  useCallback,
  useEffect,
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
import { Trans } from "i18n/Trans";
import {
  $currentDriverFormat,
  $currentDriverName,
  $currentLevelUndoQueue,
  updateCurrentLevel,
} from "models/levelsets";
import { showToastError } from "models/ui/toasts";
import { Button, TextButton } from "ui/button";
import { Dialog, msgBox, RenderPromptProps } from "ui/feedback";
import { svgs } from "ui/icon";
import { Field, Textarea } from "ui/input";
import { ColorType } from "ui/types";
import { round } from "utils/number";
import cl from "./SignatureEdit.module.scss";

interface Props extends RenderPromptProps<undefined> {}

type _TC = ChangeEventHandler<HTMLTextAreaElement>;

export const SignatureEdit: FC<Props> = ({ show, onSubmit, onCancel }) => {
  const { t } = useTranslation();
  const driverName = useUnit($currentDriverName)!;
  const { DemoToTextConfig, DemoToTextHelp, demoToText, demoFromText } =
    getDriver(driverName)!;
  const { signatureMaxLength } = getDriverFormat(
    driverName,
    useUnit($currentDriverFormat)!,
  )!;
  const level = useUnit($currentLevelUndoQueue)!.current;
  const [demo, setDemo] = useState<Uint8Array | null>(null);
  const [demoDuration, setDemoDuration] = useState(0);
  const [demoTextOptions, setDemoTextOptions] = useState<object>({});
  const [demoText, setDemoText] = useState("");
  const [demoTextError, setDemoTextError] = useState<Error | null>(null);
  const [signature, setSignature] = useState(() =>
    levelSupportSignature(level) ? level.signatureString : "",
  );
  useEffect(() => {
    if (levelSupportsDemo(level)) {
      setDemo(level.demo);
      if (demoToText) {
        const { text, duration } = demoToText(level.demo);
        setDemoText(text);
        setDemoDuration(duration);
      }
    }
    if (levelSupportSignature(level)) {
      setSignature(level.signatureString);
    }
  }, [level, demoToText]);

  const handleDemoChange = useCallback<_TC>(
    ({ target: { value } }) => {
      if (demoFromText) {
        setDemoText(value);
        try {
          const { demo, duration } = demoFromText(value);
          setDemo(demo);
          setDemoDuration(duration);
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
        const { text, duration } = demoToText(demo, options);
        setDemoText(text);
        setDemoDuration(duration);
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
          <div>
            <Trans
              i18nKey="main:demoEdit.DemoDuration"
              defaults="{frames},{sec40},{sec1000}"
              values={{
                frames: demoDuration,
                sec40: round(demoDuration / 40, 1),
                sec1000: round(demoDuration / 1000, 1),
              }}
            />
          </div>
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
