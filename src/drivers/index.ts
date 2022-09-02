import { SupaplexDriver } from "./supaplex";
import { MegaplexDriver } from "./megaplex";
import { IBaseDriver } from "./types";

export * from "./types";

const Drivers = {
  supaplex: SupaplexDriver,
  mpx: MegaplexDriver,
} as const;
const DriversHash: Partial<Record<string, IBaseDriver>> = Drivers as any;

const DETECT_ORDER: readonly (keyof typeof Drivers)[] = ["mpx", "supaplex"];

export const detectDriver = (file: ArrayBuffer) => {
  for (const name of DETECT_ORDER) {
    try {
      if (Drivers[name].reader?.readLevelset(file)) {
        return name;
      }
    } catch {}
  }
};

export const getDriver = (name: string) => DriversHash[name];
