import { LAYOUT_BREAKPOINT } from "styles/constants";

const edgesList = ["xs", "sm", "md", "lg", "xl", "xxl"] as const;
type AdaptiveRangeEdges = typeof edgesList;
type AdaptiveRangeEdge = AdaptiveRangeEdges[number];

export type AdaptiveRange =
  | AdaptiveRangeEdge
  | `${"=" | "<="}${AdaptiveRangeEdge}`;

type _ToRangeEdges<U> = U extends readonly [infer C, ...infer Rest]
  ? Rest extends readonly [any, ...any]
    ? readonly [C, Rest] | _ToRangeEdges<Rest>
    : readonly [C]
  : never;
type _ToRanges<U> = U extends readonly [infer Min, infer Max]
  ? Min extends string
    ? Max extends readonly string[]
      ? `${Min}..${Max[number]}`
      : never
    : never
  : never;

type AdaptiveRangeBetween = _ToRanges<_ToRangeEdges<AdaptiveRangeEdges>>;
type AdaptiveQueryRange = AdaptiveRange | AdaptiveRangeBetween;
export type AdaptiveQuery = AdaptiveQueryRange | readonly AdaptiveQueryRange[];

const threshold = 0.02;
const edgeStart: Record<AdaptiveRangeEdge, number | undefined> = {
  xs: undefined,
  sm: LAYOUT_BREAKPOINT.SM,
  md: LAYOUT_BREAKPOINT.MD,
  lg: LAYOUT_BREAKPOINT.LG,
  xl: LAYOUT_BREAKPOINT.XL,
  xxl: LAYOUT_BREAKPOINT.XXL,
};
const edgeEnd = edgesList.reduce<Partial<Record<AdaptiveRangeEdge, number>>>(
  (map, edge, index) => {
    const nextStart = edgeStart[edgesList[index + 1]];
    if (nextStart !== undefined) {
      map[edge] = nextStart - threshold;
    }
    return map;
  },
  {},
);

const buildWidths = (
  minWidth: number | undefined,
  maxWidth: number | undefined,
) =>
  [
    undefined !== minWidth && `(min-width: ${minWidth}px)`,
    undefined !== maxWidth && `(max-width: ${maxWidth}px)`,
  ]
    .filter(Boolean)
    .join(" and ") || "all";

const buildEdges = (
  min: AdaptiveRangeEdge | null,
  max?: AdaptiveRangeEdge | null,
) =>
  buildWidths(min ? edgeStart[min] : undefined, max ? edgeEnd[max] : undefined);

const AdaptiveRangeMediaQuery: Readonly<Record<AdaptiveQueryRange, string>> = {
  xs: buildEdges("xs"),
  sm: buildEdges("sm"),
  md: buildEdges("md"),
  lg: buildEdges("lg"),
  xl: buildEdges("xl"),
  xxl: buildEdges("xxl"),

  "=xs": buildEdges("xs", "xs"),
  "=sm": buildEdges("sm", "sm"),
  "=md": buildEdges("md", "md"),
  "=lg": buildEdges("lg", "lg"),
  "=xl": buildEdges("xl", "xl"),
  "=xxl": buildEdges("xxl", "xxl"),

  "<=xs": buildEdges(null, "xs"),
  "<=sm": buildEdges(null, "sm"),
  "<=md": buildEdges(null, "md"),
  "<=lg": buildEdges(null, "lg"),
  "<=xl": buildEdges(null, "xl"),
  "<=xxl": buildEdges(null, "xxl"),

  "xs..sm": buildEdges("xs", "sm"),
  "xs..md": buildEdges("xs", "md"),
  "xs..lg": buildEdges("xs", "lg"),
  "xs..xl": buildEdges("xs", "xl"),
  "xs..xxl": buildEdges("xs", "xxl"),
  "sm..md": buildEdges("sm", "md"),
  "sm..lg": buildEdges("sm", "lg"),
  "sm..xl": buildEdges("sm", "xl"),
  "sm..xxl": buildEdges("sm", "xxl"),
  "md..lg": buildEdges("md", "lg"),
  "md..xl": buildEdges("md", "xl"),
  "md..xxl": buildEdges("md", "xxl"),
  "lg..xl": buildEdges("lg", "xl"),
  "lg..xxl": buildEdges("lg", "xxl"),
  "xl..xxl": buildEdges("xl", "xxl"),
};

export const adaptiveRangeToString = (range: AdaptiveQuery) => {
  if (typeof range === "string") {
    return AdaptiveRangeMediaQuery[range];
  }

  return range.map((r) => AdaptiveRangeMediaQuery[r]).join(",") || "all";
};
