import { Event, Store } from "effector";

interface Options<T> {
  source: Store<T> | Event<T>;
  target: (payload: T) => any;
  flushDelay?: number;
}

export const flushDelayed = <T>({
  source,
  target,
  flushDelay = 5000,
}: Options<T>) => {
  let tId: ReturnType<typeof setTimeout>;

  const sub = source.watch((state) => {
    clearTimeout(tId);
    tId = setTimeout(() => target(state), flushDelay);
  });

  return () => {
    clearTimeout(tId);
    sub.unsubscribe();
  };
};
