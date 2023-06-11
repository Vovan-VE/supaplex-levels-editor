import { fmtLevelNumber } from "components/levelset";
import { regexpEscape } from "utils/strings";

export const compileFilter = (filter: string) => {
  const parts = filter.split(/\s+/).filter(Boolean);
  if (!parts.length) {
    return null;
  }
  return new RegExp(parts.map(regexpEscape).join("|"), "i");
};

export const filterTitles = (
  filter: RegExp | null,
  titles: readonly string[],
): Set<number> | null => {
  if (!filter) {
    return null;
  }
  const digits = String(titles.length).length;
  return titles.reduce((indices, title, i) => {
    if (filter.test(title) || filter.test(fmtLevelNumber(i, digits))) {
      indices.add(i);
    }
    return indices;
  }, new Set<number>());
};
