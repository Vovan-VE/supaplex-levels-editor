import { ISupaplexSpecPortDatabase } from "./internal";
import { newSpecPortsDatabaseFromString } from "./specPortsDb";
import { ISupaplexLevel } from "./types";

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
const P_USE_PLASMA = "use-plasma";
const P_USE_PLASMA_LIMIT = "use-plasma-limit";
const P_USE_PLASMA_TIME = "use-plasma-time";

const P_ZONKER = "2b";
const P_USE_ZONKER = "use-zonkers";

const P_SERIAL_PORTS = "ps";
const P_USE_SERIAL_PORTS = "use-serial-ports";

const P_INFOTRONS_NEEDED = "in";
const P_USE_INFOTRONS_NEEDED = "use-infotrons-needed";

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

export const parseLocalOptions = <L extends ISupaplexLevel>(
  url: URL,
  level: L,
): L => {
  const p = url.searchParams;

  let usePlasma = false;
  let usePlasmaLimit: number | undefined;
  let usePlasmaTime: number | undefined;
  if (p.has(P_PLASMA)) {
    level = level.setUsePlasma(true);
    const m = p.get(P_PLASMA)!.match(/^(\d+)?x(\d+)?$/);
    if (m) {
      if (m[1] !== undefined) usePlasmaLimit = Number(m[1]);
      if (m[2] !== undefined) usePlasmaTime = Number(m[2]);
    }
  } else {
    usePlasma = p.has(P_USE_PLASMA);
    if (p.has(P_USE_PLASMA_LIMIT)) {
      usePlasmaLimit = parseInt(p.get(P_USE_PLASMA_LIMIT)!);
    }
    if (p.has(P_USE_PLASMA_TIME)) {
      usePlasmaTime = parseInt(p.get(P_USE_PLASMA_TIME)!);
    }
  }

  const useZonker = p.has(P_ZONKER) || p.has(P_USE_ZONKER);
  const useSerialPorts = p.has(P_SERIAL_PORTS) || p.has(P_USE_SERIAL_PORTS);

  let useInfotronsNeed: number | undefined;
  {
    const s = p.get(P_INFOTRONS_NEEDED) ?? p.get(P_USE_INFOTRONS_NEEDED);
    if (s !== null) {
      useInfotronsNeed = parseInt(s);
    }
  }

  // TODO: byte
  const useFreezeEnemies = p.has(P_FREEZE_ENEMIES);

  let useSPDB: ISupaplexSpecPortDatabase | undefined;
  {
    const s = p.get(P_PORTS_DB);
    if (s !== null) {
      useSPDB = newSpecPortsDatabaseFromString(s);
    }
  }

  return (
    level
      .setUsePlasma(usePlasma)
      .setUsePlasmaLimit(usePlasmaLimit)
      .setUsePlasmaTime(usePlasmaTime)
      .setUseZonker(useZonker)
      .setUseSerialPorts(useSerialPorts)
      .setUseInfotronsNeeded(useInfotronsNeed)
      // TODO: byte
      .setInitialFreezeEnemies(useFreezeEnemies)
      .updateSpecports((prev) => useSPDB ?? prev)
  );
};
