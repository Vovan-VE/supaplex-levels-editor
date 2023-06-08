import { useEffect, useMemo, useState } from "react";
import { AdaptiveQuery, adaptiveRangeToString } from "./AdaptiveRange";

export interface QueryOptions {
  /**
   * Raw CSS media query
   *
   * This property has priority over `adaptive`.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia MDN window.matchMedia()
   * @see https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries/Using_media_queries MDN Media queries
   */
  query?: string;
  /**
   * Set query by predefined ranges based on layout breakpoints.
   *
   * This property is useless when `query` defined directly.
   */
  adaptive?: AdaptiveQuery;
  /**
   * Optional flag to disable hook
   *
   * Default is `true`.
   */
  watch?: boolean;
}
const getActualQuery = ({ query, adaptive, watch }: QueryOptions) =>
  watch ? query ?? adaptiveRangeToString(adaptive ?? []) : null;

interface EventsOptions {
  onChange?: (match: boolean) => void;
  onMatch?: () => void;
  onMismatch?: () => void;
  /**
   * Whether to fire appropriate events right on mounting
   *
   * Default is `true`.
   */
  fireOnInit?: boolean;
}

interface SingleOptions extends QueryOptions, EventsOptions {}

/**
 * A hook around `window.matchMedia()`
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia
 */
export const useMediaQuery = ({
  query,
  adaptive,
  watch = true,
  onChange,
  onMatch,
  onMismatch,
  fireOnInit = true,
}: SingleOptions) => {
  const _query = useMemo(
    () => getActualQuery({ query, adaptive, watch }),
    [query, adaptive, watch],
  );

  useEffect(() => {
    if (_query === null) {
      return;
    }

    const mql = window.matchMedia(_query);
    const handleChange = ({
      matches,
    }: Pick<MediaQueryListEvent, "matches">) => {
      onChange?.(matches);
      (matches ? onMatch : onMismatch)?.();
    };

    mql.addEventListener("change", handleChange);
    if (fireOnInit) {
      handleChange(mql);
    }

    return () => {
      mql.removeEventListener("change", handleChange);
    };
  }, [_query, onChange, onMatch, onMismatch, fireOnInit]);
};

/**
 * Stateful hook around `window.matchMedia()`
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia
 */
export const useMediaQueryState = (options: QueryOptions) => {
  const [match, setMatch] = useState(() => {
    const _query = getActualQuery(options);
    return Boolean(_query && window.matchMedia(_query).matches);
  });
  useMediaQuery({ ...options, onChange: setMatch, fireOnInit: true });
  return match;
};
