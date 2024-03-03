import { TEST_DEMO_URL, TEST_LEVEL_URL } from "configs";
import { detectDriverFormat, getDriver, getDriverFormat } from "drivers";
import { base64Decode } from "utils/encoding/base64";
import { tryGzipDecompress } from "utils/encoding/gzip";

const isSubUrl = (subject: URL, target: URL) => {
  if (subject.origin !== target.origin) return false;
  if (subject.pathname !== target.pathname) return false;
  for (const [name, value] of target.searchParams.entries()) {
    if (!subject.searchParams.has(name)) return false;
    if (subject.searchParams.get(name) !== value) return false;
  }
  return true;
};

const targetUrls = [new URL(TEST_DEMO_URL), new URL(TEST_LEVEL_URL)];

export const importLevelAsLink = async (url: string) => {
  const u = new URL(url);
  let hash = u.hash;
  if (!hash.startsWith("#") || targetUrls.every((tu) => !isSubUrl(u, tu))) {
    throw new Error("Unrecognized URL");
  }
  hash = hash.substring(1);
  let raw: ArrayBufferLike;
  if (hash.startsWith("gz,")) {
    const decompressed = await tryGzipDecompress(
      base64Decode(hash.substring(3)),
    );
    if (!decompressed) {
      // TODO: i18n
      throw new Error("Cannot decompress GZ data");
    }
    raw = decompressed;
  } else {
    raw = base64Decode(hash);
  }

  const whatIsThat = detectDriverFormat(raw, "clipboard");
  if (!whatIsThat) {
    // TODO: i18n
    throw new Error("Unrecognized raw data unpacked from URL");
  }
  const [driverName, formatName] = whatIsThat;
  const { parseLocalOptions, detectExportFormat } = getDriver(driverName)!;
  const { readLevelset } = getDriverFormat(driverName, formatName)!;

  const levelset = readLevelset(raw);
  let level = levelset.getLevel(0);
  if (parseLocalOptions) {
    level = parseLocalOptions(u, level);
  }
  const outFormat = detectExportFormat(level);
  if (!outFormat) {
    throw new Error("Cannot detect final format to use");
  }
  const { writeLevelset, fileExtensionDefault } = getDriverFormat(
    driverName,
    outFormat,
  );
  return new File(
    [writeLevelset(levelset.setLevel(0, level))],
    "clipboard." + fileExtensionDefault,
  );
};

// - as new file
