import { DAT } from "./dat";
import { MPX } from "./mpx";
import { SP } from "./sp";

export const formats = {
  // "detect" order:
  // MPX first since it has "MPX " header
  mpx: MPX,
  // DAT second because I check its length to be a module of 1536
  dat: DAT,
  // SP has only min size limit
  sp: SP,
};

export type FormatName = keyof typeof formats;
export const defaultFormat: FormatName = "dat";
