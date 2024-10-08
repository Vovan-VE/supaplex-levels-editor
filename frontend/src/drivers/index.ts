import { IBounds } from "../utils/rect";
import { SupaplexDriver } from "./supaplex";
import {
  IBaseDriver,
  IBaseTile,
  ISizeLimit,
  ISupportReport,
  ISupportReportMessage,
  SupportReportType,
} from "./types";

export * from "./types";

const Drivers = {
  supaplex: SupaplexDriver,
} as const;

const ReplacedDrivers = {
  mpx: "supaplex",
} as const;
export const REPLACED_DRIVERS: Readonly<Partial<Record<string, string>>> =
  ReplacedDrivers;
// type ReplacedDriverName = keyof typeof ReplacedDrivers;

export const FALLBACK_FORMAT: Partial<Record<string, string>> = {
  supaplex: "dat",
  mpx: "mpx",
};

const DriversHash: Partial<Record<string, IBaseDriver>> = Drivers as any;
for (const [old, actual] of Object.entries(ReplacedDrivers)) {
  DriversHash[old] = DriversHash[actual];
}

type TDrivers = typeof Drivers;
export type DriverName = keyof TDrivers;
// export type StoredDriverName = DriverName | ReplacedDriverName;

export const DISPLAY_ORDER: readonly DriverName[] = ["supaplex"];
const DETECT_ORDER: readonly DriverName[] = ["supaplex"];

export const detectDriverFormat = (
  file: ArrayBuffer,
  filename: string,
): readonly [DriverName, string] | undefined => {
  for (const name of DETECT_ORDER) {
    // SP without demo was opening as DAT, and so cause no demo support.
    // To resolve the issue I check file extension as the easiest way.
    // This should be enhanced with separate "detect" function.
    const matches: { format: string; extensionOk: boolean }[] = [];

    for (const [format, f] of Object.entries(Drivers[name].formats)) {
      try {
        if (f.readLevelset(file)) {
          const ext = getFileExt(filename);
          matches.push({
            format,
            extensionOk: Boolean(ext && isExtValid(ext, name, format)),
          });
        }
      } catch {}
    }

    if (matches.length) {
      // `true` first, `false` last
      matches.sort((a, b) => +b.extensionOk - +a.extensionOk);
      return [name, matches[0].format];
    }
  }
};

interface GetDriverFn {
  <T extends DriverName>(name: T): TDrivers[T];
  (name: string): (typeof DriversHash)[string];
}
export const getDriver: GetDriverFn = (name: string) => DriversHash[name];

type GetProp<T, K> = T extends object ? (K extends keyof T ? T[K] : T) : T;
interface GetDriverFormatFn {
  <T extends DriverName>(
    driverName: T,
    formatName: string,
  ): TDrivers[T]["formats"][string];
  (
    driverName: string,
    formatName: string,
  ): GetProp<GetProp<(typeof DriversHash)[string], "formats">, string>;
}
export const getDriverFormat: GetDriverFormatFn = (
  driverName: string,
  formatName: string,
) => DriversHash[driverName]?.formats[formatName];

export const canResizeWidth = ({
  minWidth = 1,
  maxWidth,
}: Pick<ISizeLimit, "minWidth" | "maxWidth">): boolean =>
  maxWidth === undefined || minWidth < maxWidth;

export const canResizeHeight = ({
  minHeight = 1,
  maxHeight,
}: Pick<ISizeLimit, "minHeight" | "maxHeight">): boolean =>
  maxHeight === undefined || minHeight < maxHeight;

export const canResize = (r: ISizeLimit): boolean =>
  canResizeWidth(r) || canResizeHeight(r);

export const canResizeTo = (limit: ISizeLimit, want: IBounds): boolean => {
  const { minWidth = 1, minHeight = 1, maxWidth, maxHeight } = limit;
  const { width, height } = want;
  if (width < minWidth || height < minHeight) return false;
  if (maxWidth !== undefined && width > maxWidth) return false;
  if (maxHeight !== undefined && height > maxHeight) return false;
  //
  return true;
};

const getFileExt = (filename: string) => filename.match(/.\.([^.]*)$/)?.[1];

interface _FN {
  hasExt: boolean;
  isExtValid: boolean;
  basename: string;
  ext: string;
}
export const parseFormatFilename = (
  filename: string,
  driverName: DriverName,
  driverFormat: string,
): _FN => {
  const ext = getFileExt(filename);
  if (ext === undefined) {
    return {
      hasExt: false,
      isExtValid: false,
      basename: filename,
      ext: "",
    };
  }

  return {
    hasExt: true,
    isExtValid: isExtValid(ext, driverName, driverFormat),
    basename: filename.substring(0, filename.length - ext.length - 1),
    ext,
  };
};

export const isExtValid = (
  ext: string,
  driverName: DriverName,
  driverFormat: string,
) => {
  const { fileExtensionDefault, fileExtensions } = getDriverFormat(
    driverName,
    driverFormat,
  );

  return fileExtensions
    ? new RegExp(`^${fileExtensions.source}$`, "i").test(ext)
    : ext.toLowerCase() === fileExtensionDefault.toLowerCase();
};

export const summarySupportReport = (
  input: Iterable<ISupportReportMessage>,
): ISupportReport | null => {
  let type: SupportReportType | null = null;
  const messages: ISupportReportMessage[] = [];
  for (const m of input) {
    messages.push(m);
    if (type === null || m.type < type) {
      type = m.type;
    }
  }
  if (type === null) {
    return null;
  }
  return {
    type,
    messages,
  };
};

export const getTilesForToolbar = <T extends IBaseTile<any>>(
  tiles: readonly T[],
): readonly (readonly [number, T])[] =>
  tiles
    .map((tile, i) => [i, tile] as const)
    .sort(
      (
        [aI, { toolbarOrder: aO = Number.MAX_SAFE_INTEGER }],
        [bI, { toolbarOrder: bO = Number.MAX_SAFE_INTEGER }],
      ) => aO - bO || aI - bI,
    );

export const getTilesVariantsMap = (
  tiles: readonly IBaseTile<any>[],
): ReadonlyMap<number, number> => {
  const map = new Map<number, number>();
  for (const { value, metaTile } of tiles) {
    if (metaTile) {
      map.set(value, metaTile.primaryValue);
    }
  }
  return map;
};
