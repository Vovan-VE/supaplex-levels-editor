import { useUnit } from "effector-react";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import { Trans } from "i18n/Trans";
import { $layoutType, LayoutType, setLayoutType } from "models/settings";
import { Field, RadioGroup, RadioOptions } from "ui/input";

const OPTIONS: RadioOptions<LayoutType> = [
  {
    value: LayoutType.AUTO,
    label: <Trans i18nKey="main:settings.layout.Auto" />,
  },
  {
    value: LayoutType.COMPACT,
    label: <Trans i18nKey="main:settings.layout.Compact" />,
  },
  {
    value: LayoutType.FULL,
    label: <Trans i18nKey="main:settings.layout.Full" />,
  },
];

export const LayoutChoice: FC = () => {
  const { t } = useTranslation();
  return (
    <Field labelElement="div" label={t("main:settings.layout.Label")}>
      <RadioGroup
        options={OPTIONS}
        value={useUnit($layoutType)}
        onChange={setLayoutType}
        flowInline
      />
    </Field>
  );
};
