import { useStore } from "effector-react";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import { InlineTile } from "drivers/supaplex/InlineTile";
import { SpChipClassic, SpChipWinplex } from "drivers/supaplex/Tile";
import { TILE_CHIP_L, TILE_CHIP_R } from "drivers/supaplex/tiles-id";
import { Trans } from "i18n/Trans";
import { $spChip, setSpChip } from "models/settings";
import { Field, RadioGroup, RadioOptions } from "ui/input";

const OPTIONS: RadioOptions<0 | 1> = [
  {
    value: 0,
    label: (
      <>
        <InlineTile tile={TILE_CHIP_L} tileClassName={SpChipClassic} />
        <InlineTile tile={TILE_CHIP_R} tileClassName={SpChipClassic} />{" "}
        <Trans i18nKey="main:settings.doubleChip.Classic" />
      </>
    ),
  },
  {
    value: 1,
    label: (
      <>
        <InlineTile tile={TILE_CHIP_L} tileClassName={SpChipWinplex} />
        <InlineTile tile={TILE_CHIP_R} tileClassName={SpChipWinplex} />{" "}
        <Trans i18nKey="main:settings.doubleChip.WinPlex" />
      </>
    ),
  },
];

export const SpChips: FC = () => {
  const { t } = useTranslation();
  return (
    <Field label={t("main:settings.doubleChip.Label")}>
      <RadioGroup
        options={OPTIONS}
        value={useStore($spChip)}
        onChange={setSpChip}
      />
    </Field>
  );
};
