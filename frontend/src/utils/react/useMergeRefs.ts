import { Ref, RefCallback, useMemo } from "react";

type AnyRef<T> = Ref<T> | undefined;
type RefsTuple<T> = readonly [ref1: AnyRef<T>, ref2: AnyRef<T>, ...AnyRef<T>[]];

const setRef = <T>(ref: AnyRef<T>, value: T | null) => {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
};

/**
 * Merge multiple refs into one
 *
 * ```tsx
 * const C: FC<P & RefAttributes<T>> = ({ ref, ...props }) => {
 *   const myRef = useRef<T>(null);
 *   const setRef = useMergeRefs(ref, myRef);
 *
 *   // useEffect(() => {
 *   //   myRef.current?. ...
 *   //}, []);
 *
 *   return <E ref={setRef} />;
 * };
 *
 * console.log(<C ref={...} />);
 * ```
 */
export const useMergeRefs = <T, Args extends RefsTuple<T>>(
  ...refs: Args
): RefCallback<T> | null =>
  useMemo(
    () =>
      refs.some(Boolean)
        ? (value: T | null) => {
            if (value === null || value === undefined) {
              // reverse order (maybe unnecessary, but seems logical)
              for (let i = refs.length; i-- > 0; ) {
                setRef(refs[i], value);
              }
            } else {
              for (let i = 0; i < refs.length; i++) {
                setRef(refs[i], value);
              }
            }
          }
        : null,
    [refs],
  );
