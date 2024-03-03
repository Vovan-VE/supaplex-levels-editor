import { useUnit } from "effector-react";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import { Trans } from "i18n/Trans";
import { $coordsDisplayBasis, setCoordsDisplayBasis } from "models/settings";
import { Field, RadioGroup, RadioOptions } from "ui/input";
import { TileCoords } from "./display";

const OPTIONS: RadioOptions<0 | 1> = [
  {
    value: 0,
    label: (
      <>
        <Trans i18nKey="main:settings.coords.ZeroBased" />
        {": "}
        <TileCoords x={0} y={0} base={0} />
        {" ... "}
        <TileCoords x={59} y={23} base={0} />
      </>
    ),
  },
  {
    value: 1,
    label: (
      <>
        <Trans i18nKey="main:settings.coords.OneBased" />
        {": "}
        <TileCoords x={0} y={0} base={1} />
        {" ... "}
        <TileCoords x={59} y={23} base={1} />
      </>
    ),
  },
];

export const CoordsChoice: FC = () => {
  const { t } = useTranslation();
  return (
    <Field labelElement="div" label={t("main:settings.coords.Label")}>
      <RadioGroup
        options={OPTIONS}
        value={useUnit($coordsDisplayBasis)}
        onChange={setCoordsDisplayBasis}
      />
    </Field>
  );
};
