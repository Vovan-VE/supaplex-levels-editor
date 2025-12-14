import { Ref, RefCallback, useMemo } from "react";
import { isNotNull } from "../fn";

type AnyRef<T> = Ref<T> | undefined;
type RefsTuple<T> = readonly [ref1: AnyRef<T>, ref2: AnyRef<T>, ...AnyRef<T>[]];

const setRef = <T>(ref: NonNullable<Ref<T>>, value: T | null) => {
  if (typeof ref === "function") {
    return (
      ref(value) ||
      (() => {
        ref(null);
      })
    );
  }

  ref.current = value;
  return () => {
    ref.current = null;
  };
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
): RefCallback<T> | undefined =>
  useMemo(() => {
    const refsOk = refs.filter(isNotNull);
    if (!refsOk.length) return undefined;
    return (value: T | null) => {
      /** @deprecated never should happen since we did return cleanup function */
      if (value === null || value === undefined) {
        if (import.meta.env.DEV) {
          console.warn("unexpected resetting ref", value, new Error("stack->"));
        }
        return;
      }

      const cleanup: (() => void)[] = [];
      for (let i = 0; i < refsOk.length; i++) {
        const f = setRef(refsOk[i], value);
        if (f) {
          cleanup.unshift(f);
        }
      }

      return () => {
        cleanup.forEach((f) => {
          f();
        });
      };
    };
  }, [refs]);
