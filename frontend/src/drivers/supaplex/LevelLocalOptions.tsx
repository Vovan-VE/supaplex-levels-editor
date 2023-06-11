import { useCallback } from "react";
import { Checkbox, IntegerInput } from "ui/input";
import { LevelConfiguratorProps } from "../types";
import { InlineTile } from "./InlineTile";
import { TILE_HW_LAMP_R, TILE_HW_STRIPES } from "./tiles-id";
import { ISupaplexLevel } from "./types";
import cl from "./LevelLocalOptions.module.scss";

export const LevelLocalOptions = <L extends ISupaplexLevel>({
  level,
  onChange,
}: LevelConfiguratorProps<L>) => {
  const {
    usePlasma,
    usePlasmaLimit,
    usePlasmaTime,
    useZonker,
    useSerialPorts,
  } = level;

  const handlePlasmaChange = useCallback(
    (checked: boolean) => onChange(level.setUsePlasma(checked)),
    [level, onChange],
  );
  const handlePlasmaLimitChange = useCallback(
    (v: number | null) => onChange(level.setUsePlasmaLimit(v ?? undefined)),
    [level, onChange],
  );
  const handlePlasmaTimeChange = useCallback(
    (v: number | null) => onChange(level.setUsePlasmaTime(v ?? undefined)),
    [level, onChange],
  );
  const handleZonkerChange = useCallback(
    (checked: boolean) => onChange(level.setUseZonker(checked)),
    [level, onChange],
  );
  const handleSerialPortsChange = useCallback(
    (checked: boolean) => onChange(level.setUseSerialPorts(checked)),
    [level, onChange],
  );

  return (
    <>
      <div>
        <Checkbox checked={usePlasma} onChange={handlePlasmaChange}>
          Replace <InlineTile tile={TILE_HW_STRIPES} /> with Plasma
        </Checkbox>
      </div>
      <div className={cl.nested}>
        <div>
          Growth limit{" "}
          <IntegerInput
            value={usePlasmaLimit ?? null}
            onChange={handlePlasmaLimitChange}
            disabled={!usePlasma}
            className={cl.shortInt}
            placeholder="200"
          />{" "}
          tiles
        </div>
        <div>
          Fast growth phase starts after{" "}
          <IntegerInput
            value={usePlasmaTime ?? null}
            onChange={handlePlasmaTimeChange}
            disabled={!usePlasma}
            className={cl.shortInt}
            placeholder="2400"
          />{" "}
          frames
        </div>
      </div>
      <div>
        <Checkbox checked={useZonker} onChange={handleZonkerChange}>
          Replace <InlineTile tile={TILE_HW_LAMP_R} /> 2x2 with Zonker
        </Checkbox>
      </div>
      <div>
        <Checkbox checked={useSerialPorts} onChange={handleSerialPortsChange}>
          Allow serial ports
        </Checkbox>
      </div>
    </>
  );
};

const P_PLASMA = "use-plasma";
const P_PLASMA_LIMIT = "use-plasma-limit";
const P_PLASMA_TIME = "use-plasma-time";
const P_ZONKER = "use-zonkers";
const P_SERIAL_PORTS = "use-serial-ports";
export const applyLocalOptions = <L extends ISupaplexLevel>(
  level: L,
  url: URL,
) => {
  const p = url.searchParams;
  if (level.usePlasma) {
    p.set(P_PLASMA, "");
    if (level.usePlasmaLimit !== undefined) {
      p.set(P_PLASMA_LIMIT, String(level.usePlasmaLimit));
    }
    if (level.usePlasmaTime !== undefined) {
      p.set(P_PLASMA_TIME, String(level.usePlasmaTime));
    }
  }
  if (level.useZonker) {
    p.set(P_ZONKER, "");
  }
  if (level.useSerialPorts) {
    p.set(P_SERIAL_PORTS, "");
  }
  return url;
};
