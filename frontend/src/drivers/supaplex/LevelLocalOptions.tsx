import { useCallback } from "react";
import { Checkbox, IntegerInput } from "ui/input";
import { LevelConfiguratorProps } from "../types";
import { InlineTile } from "./InlineTile";
import { TILE_HW_LAMP_R, TILE_HW_STRIPES, TILE_INFOTRON } from "./tiles-id";
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
    useInfotronsNeeded,
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
  const handleInfotronsNeededChange = useCallback(
    (v: number | null) => onChange(level.setUseInfotronsNeeded(v ?? undefined)),
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
      <div className={cl.notCheckbox}>
        Override <InlineTile tile={TILE_INFOTRON} /> Needed{" "}
        <IntegerInput
          value={useInfotronsNeeded ?? null}
          onChange={handleInfotronsNeededChange}
          className={cl.shortInt}
        />{" "}
        (can be &gt; <code>255</code> or exactly <code>0</code>)
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
const P_PLASMA = "2a";
const P_ZONKER = "2b";
const P_SERIAL_PORTS = "ps";
const P_INFOTRONS_NEEDED = "in";
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
  if (!level.specports.isStdCompatible(level.width)) {
    p.set(P_PORTS_DB, level.specports.toString());
  }
  return url;
};
