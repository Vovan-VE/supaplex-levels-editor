import { SupaplexDriver } from "./supaplex";
import { MegaplexDriver } from "./megaplex";

export const Drivers = {
  supaplex: SupaplexDriver,
  mpx: MegaplexDriver,
} as const;

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
