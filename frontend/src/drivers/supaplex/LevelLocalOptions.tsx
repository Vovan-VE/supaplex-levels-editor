import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Trans } from "i18n/Trans";
import { Checkbox, IntegerInput } from "ui/input";
import { constElement } from "utils/react";
import { LevelLocalOptionsProps } from "../types";
import { InlineTile } from "./InlineTile";
import { TILE_HW_LAMP_R, TILE_HW_STRIPES, TILE_INFOTRON } from "./tiles-id";
import { ISupaplexLevel } from "./types";
import cl from "./LevelLocalOptions.module.scss";

const compUsePlasma = {
  tile: constElement(<InlineTile tile={TILE_HW_STRIPES} />),
};
const compUseZonker = {
  tile: constElement(<InlineTile tile={TILE_HW_LAMP_R} />),
};
const compUseInfotrons = {
  tile: constElement(<InlineTile tile={TILE_INFOTRON} />),
};

export const LevelLocalOptions = <L extends ISupaplexLevel>({
  level,
  onChange,
}: LevelLocalOptionsProps<L>) => {
  const { t } = useTranslation();
  const isRo = !onChange;
  const {
    usePlasma,
    usePlasmaLimit,
    usePlasmaTime,
    useZonker,
    useSerialPorts,
    useInfotronsNeeded,
  } = level;

  const handlePlasmaChange = useMemo(
    () =>
      onChange && ((checked: boolean) => onChange(level.setUsePlasma(checked))),
    [level, onChange],
  );
  const handlePlasmaLimitChange = useMemo(
    () =>
      onChange &&
      ((v: number | null) => onChange(level.setUsePlasmaLimit(v ?? undefined))),
    [level, onChange],
  );
  const handlePlasmaTimeChange = useMemo(
    () =>
      onChange &&
      ((v: number | null) => onChange(level.setUsePlasmaTime(v ?? undefined))),
    [level, onChange],
  );
  const handleZonkerChange = useMemo(
    () =>
      onChange && ((checked: boolean) => onChange(level.setUseZonker(checked))),
    [level, onChange],
  );
  const handleSerialPortsChange = useMemo(
    () =>
      onChange &&
      ((checked: boolean) => onChange(level.setUseSerialPorts(checked))),
    [level, onChange],
  );
  const handleInfotronsNeededChange = useMemo(
    () =>
      onChange &&
      ((v: number | null) =>
        onChange(level.setUseInfotronsNeeded(v ?? undefined))),
    [level, onChange],
  );

  return (
    <>
      <div>
        <Checkbox
          checked={usePlasma}
          onChange={handlePlasmaChange}
          disabled={isRo}
        >
          <Trans
            i18nKey="main:supaplex.localOptions.UsePlasma"
            components={compUsePlasma}
          />
        </Checkbox>
      </div>
      <div className={cl.nested}>
        <div>
          {t("main:supaplex.localOptions.PlasmaLimitLabel")}{" "}
          <IntegerInput
            value={usePlasmaLimit ?? null}
            onChange={handlePlasmaLimitChange}
            disabled={!usePlasma || isRo}
            className={cl.shortInt}
            placeholder="200"
          />{" "}
          {t("main:supaplex.localOptions.PlasmaLimitUnits")}
        </div>
        <div>
          {t("main:supaplex.localOptions.PlasmaTimeLabel")}{" "}
          <IntegerInput
            value={usePlasmaTime ?? null}
            onChange={handlePlasmaTimeChange}
            disabled={!usePlasma || isRo}
            className={cl.shortInt}
            placeholder="2400"
          />{" "}
          {t("main:supaplex.localOptions.PlasmaTimeUnits")}
        </div>
      </div>
      <div>
        <Checkbox
          checked={useZonker}
          onChange={handleZonkerChange}
          disabled={isRo}
        >
          <Trans
            i18nKey="main:supaplex.localOptions.UseZonker"
            components={compUseZonker}
          />
        </Checkbox>
      </div>
      <div>
        <Checkbox
          checked={useSerialPorts}
          onChange={handleSerialPortsChange}
          disabled={isRo}
        >
          {t("main:supaplex.localOptions.UseSerialPorts")}
        </Checkbox>
      </div>
      <div className={cl.notCheckbox}>
        <Trans
          i18nKey="main:supaplex.localOptions.UseInfotronsNeed"
          components={compUseInfotrons}
        />{" "}
        <IntegerInput
          value={useInfotronsNeeded ?? null}
          onChange={handleInfotronsNeededChange}
          className={cl.shortInt}
          disabled={isRo}
        />{" "}
        <Trans i18nKey="main:supaplex.localOptions.UseInfotronsNeedHint" />
      </div>
    </>
  );
};
