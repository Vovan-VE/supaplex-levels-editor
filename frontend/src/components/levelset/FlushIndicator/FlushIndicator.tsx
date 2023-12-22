import cn from "classnames";
import { useUnit } from "effector-react";
import { FC, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { $displayReadOnly } from "backend";
import { Trans } from "i18n/Trans";
import { $flushError, $isFlushPending } from "models/levelsets/flush";
import { TextButton } from "ui/button";
import { msgBox, Spinner } from "ui/feedback";
import { svgs } from "ui/icon";
import { ColorType, ContainerProps } from "ui/types";
import cl from "./FlushIndicator.module.scss";

const displayReadOnly = !!$displayReadOnly;
const useDisplayRO = displayReadOnly
  ? () => useUnit($displayReadOnly!)
  : () => false;

interface Props extends ContainerProps {}

export const FlushIndicator: FC<Props> = ({ className, ...rest }) => {
  const { t } = useTranslation();
  const readOnly = useDisplayRO();
  const isPending = useUnit($isFlushPending);
  const error = useUnit($flushError);

  const handleErrorClick = useMemo(
    () =>
      error
        ? () =>
            msgBox(
              <>
                {t("main:files.messages.FailedFlushToStorage")}
                <br />
                {error!.message}
              </>,
              {
                size: "small",
              },
            )
        : undefined,
    [error, t],
  );

  return displayReadOnly && readOnly ? (
    <TextButton
      {...rest}
      key="r"
      uiColor={ColorType.WARN}
      className={cn(cl.readonly, className)}
      icon={<svgs.Warning />}
      onClick={handleReadOnlyClick}
      title={t("web:app.readOnly.ButtonHint")}
    />
  ) : isPending ? (
    <TextButton
      {...rest}
      key="p"
      className={cn(cl.pending, className)}
      icon={<Spinner />}
      title={t("main:files.messages.FlushingToStorage")}
    />
  ) : (
    <TextButton
      {...rest}
      key="e"
      uiColor={ColorType.DANGER}
      className={cn(error ? cl.error : cl.success, className)}
      icon={<svgs.Cross />}
      onClick={handleErrorClick}
      title={t("main:files.messages.CannotFlushToStorage")}
    />
  );
};

const handleReadOnlyClick = () =>
  msgBox(
    <>
      <p>
        <Trans i18nKey="web:app.readOnly.B010" />
      </p>
      <p>
        <Trans i18nKey="web:app.readOnly.B020" />
      </p>
      <p>
        <Trans i18nKey="web:app.readOnly.B030" />
      </p>
    </>,
    { size: "small" },
  );
