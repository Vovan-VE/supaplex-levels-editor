import { MutableRefObject, Ref, RefCallback, useMemo } from "react";

type AnyRef<T> = Ref<T> | MutableRefObject<T | null> | undefined;

const setRef = <T>(ref: AnyRef<T>, value: T | null) => {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    (ref as MutableRefObject<T | null>).current = value;
  }
};

/**
 * Merge multiple refs into one
 *
 * ```tsx
 * const C = forwardRef<T | null, P>((props, ref) => {
 *   const myRef = useRef<T | null>(null);
 *   const setRef = useMergeRefs(ref, myRef);
 *
 *   // useEffect(() => {
 *   //   myRef.current?. ...
 *   //}, []);
 *
 *   return <E ref={setRef} />;
 * });
 *
 * console.log(<C ref={...} />);
 * ```
 */
export const useMergeRefs = <T>(...refs: AnyRef<T>[]): RefCallback<T> | null =>
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
