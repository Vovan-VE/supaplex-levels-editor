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

export const detectDriverFormat = (
  file: ArrayBuffer,
): readonly [DriverName, string] | undefined => {
  for (const name of DETECT_ORDER) {
    for (const [format, f] of Object.entries(Drivers[name].formats)) {
      try {
        if (f.readLevelset(file)) {
          return [name, format];
        }
      } catch {}
    }
  }
};

interface GetDriverFn {
  <T extends DriverName>(name: T): TDrivers[T];
  (name: string): typeof DriversHash[string];
}
export const getDriver: GetDriverFn = (name: string) => DriversHash[name];

type GetProp<T, K> = T extends object ? (K extends keyof T ? T[K] : T) : T;
interface GetDriverFormatFn {
  <T extends DriverName>(
    driverName: T,
    formatName: string,
  ): TDrivers[T]["formats"][string];
  (driverName: string, formatName: string): GetProp<
    GetProp<typeof DriversHash[string], "formats">,
    string
  >;
}
export const getDriverFormat: GetDriverFormatFn = (
  driverName: string,
  formatName: string,
) => DriversHash[driverName]?.formats[formatName];
