export const fmtLevelNumber = (index: number, maxDigits: number) =>
  String(index + 1).padStart(maxDigits, "0");

const reDecor = /[-\s=[\](){}<>~]+/;
const reDecorTrim = new RegExp(`^${reDecor.source}|${reDecor.source}$`, "g");

const fmtLevelTitle = (title: string) => title.replace(reDecorTrim, "");

const reFNClean = /[<>:?*|/\\\n]+/g;
const reFNDecor = /[-\s=[\](){}~.]+/;
const reFNTrim = new RegExp(`^${reFNDecor.source}|${reFNDecor.source}$`, "g");

export const fmtLevelForFilename = (index: number, title: string) => {
  let res = String(index + 1);

  const titleFmt = title.replace(reFNClean, ".").replace(reFNTrim, "");
  if (titleFmt) {
    res += "." + titleFmt;
  }
  return res;
};

export const fmtLevelShort = (
  index: number,
  maxDigits: number,
  title: string,
) => `${fmtLevelNumber(index, maxDigits)}: ${fmtLevelTitle(title)}`;

export const fmtLevelFull = (index: number, maxDigits: number, title: string) =>
  `${fmtLevelNumber(index, maxDigits)}: ${title}`;
