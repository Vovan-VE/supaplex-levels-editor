import { FC, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Trans } from "i18n/Trans";
import { Checkbox, Field } from "ui/input";
import { DemoToTextConfigProps } from "../types";
import { ToTextOptions } from "./demoText";

export const DemoToTextConfig: FC<DemoToTextConfigProps<ToTextOptions>> = ({
  options,
  onChange,
}) => {
  const { t } = useTranslation();
  return (
    <Field help={<Trans i18nKey="main:supaplex.demoEditAsText.UseTilesHelp" />}>
      <Checkbox
        checked={options.useTilesTime ?? false}
        onChange={useCallback(
          (useTilesTime: boolean) => onChange({ ...options, useTilesTime }),
          [onChange, options],
        )}
      >
        {t("main:supaplex.demoEditAsText.UseTiles")}
      </Checkbox>
    </Field>
  );
};
