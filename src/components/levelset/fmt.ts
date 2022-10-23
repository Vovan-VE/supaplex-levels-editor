export const fmtLevelNumber = (index: number, maxDigits: number) =>
  String(index + 1).padStart(maxDigits, "0");

const fmtLevelTitle = (title: string) =>
  title.replace(/^[-\s=[\](){}<>~]+|[-\s=[\](){}<>~]+$/g, "");

export const fmtLevelShort = (
  index: number,
  maxDigits: number,
  title: string,
) => `${fmtLevelNumber(index, maxDigits)}: ${fmtLevelTitle(title)}`;

export const fmtLevelFull = (index: number, maxDigits: number, title: string) =>
  `${fmtLevelNumber(index, maxDigits)}: ${title}`;
