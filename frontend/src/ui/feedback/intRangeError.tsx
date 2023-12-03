import { ReactNode } from "react";
import { Trans } from "i18n/Trans";

export const intRangeError = (
  value: number | null,
  min?: number | null,
  max?: number | null,
): ReactNode => {
  if (value === null) {
    return <Trans i18nKey="main:validate.Required" />;
  }
  if (min !== undefined && min !== null && value < min) {
    return <Trans i18nKey="main:validate.IntMin" values={{ min }} />;
  }
  if (max !== undefined && max !== null && value > max) {
    return <Trans i18nKey="main:validate.IntMax" values={{ max }} />;
  }
};
