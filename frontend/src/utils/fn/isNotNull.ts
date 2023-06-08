/**
 * A not-null predicate (includes undefined)
 *
 * ```ts
 * const input = ['a', 'b', null, undefined];
 * //    ^^^^^ (string | null | undefined)[]
 *
 * const output = input.filter(isDefined);
 * //    ^^^^^^ string[]
 * ```
 *
 * @param value
 */
export const isNotNull = <T>(value: T | null | undefined): value is T =>
  null !== value && undefined !== value;
