// https://github.com/microsoft/TypeScript/issues/13298#issuecomment-596068031
type TupleToUnionWithoutDuplicated<A extends ReadonlyArray<any>> = {
  [I in keyof A]: unknown extends {
    [J in keyof A]: J extends I ? never : A[J] extends A[I] ? unknown : never;
  }[number]
    ? never
    : A[I];
}[number];
type TupleToUnionOnlyDuplicated<A extends ReadonlyArray<any>> = Exclude<
  A[number],
  TupleToUnionWithoutDuplicated<A>
>;
type HasUnionMissing<Desired, Actual> = Exclude<Desired, Actual> extends never
  ? false
  : true;
type Missing<Desired, Actual> = Exclude<Desired, Actual> extends never
  ? never
  : Exclude<Desired, Actual>;
type HasUnionExtra<Desired, Actual> = Exclude<Actual, Desired> extends never
  ? false
  : true;
type Extra<Desired, Actual> = Exclude<Actual, Desired> extends never
  ? never
  : Exclude<Actual, Desired>;
type Error<Union, Msg> = [...string[], Union, "is/are", Msg];
type AllUnionTuple<K, T extends ReadonlyArray<any>> = HasUnionExtra<
  K,
  T[number]
> extends true
  ? Error<Extra<K, T[number]>, "extra">
  : HasUnionMissing<K, T[number]> extends true
  ? Error<Missing<K, T[number]>, "missing">
  : T[number] extends TupleToUnionWithoutDuplicated<T>
  ? T
  : Error<TupleToUnionOnlyDuplicated<T>, "duplicated">;

/**
 * Cast a constant array to a tuple
 *
 * Cast given constant array to a tuple with all union values. The array must
 * contain all the union alternatives without duplicates and without unknown
 * extra values.
 *
 * Example:
 *
 * ```ts
 * const VALUES = keysTuple<'x' | 'y'>()(['x', 'y']);      // ok
 * const VALUES = keysTuple<'x' | 'y'>()(['x']);           // error: 'y' missing
 * const VALUES = keysTuple<'x' | 'y'>()(['x', 'y', 'y']); // error: 'y' duplicated
 * const VALUES = keysTuple<'x' | 'y'>()(['x', 'y', 'z']); // error: 'z' unknown
 * const VALUES = keysTuple<'x' | 'y'>()(['x', 'z']);      // error: 'z' unknown
 * ```
 *
 * @see https://github.com/microsoft/TypeScript/issues/13298#issuecomment-596068031
 */
export const keysTuple =
  <T>() =>
  <U extends ReadonlyArray<any>>(cc: AllUnionTuple<T, U>) =>
    cc;
