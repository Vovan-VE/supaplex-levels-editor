import { SupaplexDriver } from "./supaplex";
import { MegaplexDriver } from "./megaplex";
import { IBaseDriver } from "./types";

export * from "./types";

const Drivers = {
  supaplex: SupaplexDriver,
  mpx: MegaplexDriver,
} as const;

const DriversHash: Partial<Record<string, IBaseDriver>> = Drivers as any;

type TDrivers = typeof Drivers;
export type DriverName = keyof TDrivers;

export const DISPLAY_ORDER: readonly DriverName[] = ["supaplex", "mpx"];
const DETECT_ORDER: readonly DriverName[] = ["mpx", "supaplex"];

export const detectDriver = (file: ArrayBuffer) => {
  for (const name of DETECT_ORDER) {
    try {
      if (Drivers[name].reader?.readLevelset(file)) {
        return name;
      }
    } catch {}
  }
};

interface GetDriverFn {
  <T extends DriverName>(name: T): TDrivers[T];
  (name: string): typeof DriversHash[string];
}
export const getDriver: GetDriverFn = (name: string) => DriversHash[name];
