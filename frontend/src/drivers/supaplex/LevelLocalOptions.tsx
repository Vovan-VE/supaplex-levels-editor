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

// shorter parameters
// `?use-plasma=&use-plasma-limit=20&use-plasma-time=200&use-zonkers=&use-serial-ports=#`
// becomes:
// `?2a=20x200&2b&ps#`
// `use-serial-ports` can now just be `ps`
// no `=` needed
// `use-zonkers` is now `2b`, same as zonker hex code
// now instead of 3 params for plasma we use
// `2a={plasma_limit}x{plasma_time}`
// for default values use space
// `2a=16x`
// this will use limit of `16` and default plasma time
// if both params are default then `2a=x` works, but you can then omit the value
// and just use `2a`
// `use-infotrons-needed` is `in`
//
// `force-all-ports-special`
const P_PLASMA = "2a";
const P_ZONKER = "2b";
const P_SERIAL_PORTS = "ps";
const P_INFOTRONS_NEEDED = "in";
const P_FREEZE_ENEMIES = "fe";
const P_PORTS_DB = "pd";
export const applyLocalOptions = <L extends ISupaplexLevel>(
  level: L,
  url: URL,
) => {
  const p = url.searchParams;
  if (level.usePlasma) {
    const limit =
      level.usePlasmaLimit !== undefined ? String(level.usePlasmaLimit) : "";
    const time =
      level.usePlasmaTime !== undefined ? String(level.usePlasmaTime) : "";
    p.set(P_PLASMA, limit || time ? `${limit}x${time}` : "");
  }
  if (level.useZonker) {
    p.set(P_ZONKER, "");
  }
  if (level.useSerialPorts) {
    p.set(P_SERIAL_PORTS, "");
  }
  if (level.useInfotronsNeeded !== undefined) {
    p.set(P_INFOTRONS_NEEDED, String(level.useInfotronsNeeded));
  }
  if (level.initialFreezeEnemies) {
    // TODO: byte
    p.set(P_FREEZE_ENEMIES, "1");
  }
  if (!level.specports.isStdCompatible(level.width)) {
    p.set(P_PORTS_DB, level.specports.toString());
  }
  return url;
};
