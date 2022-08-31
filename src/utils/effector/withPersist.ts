import { createEvent, Store } from "effector";
import { PersistentStoreDriverSingle } from "../store";

export const withPersist = <S>(
  store: Store<S>,
  driver:
    | PersistentStoreDriverSingle<S>
    | Promise<PersistentStoreDriverSingle<S>>,
  key: string,
) => {
  (async () => {
    const drv = await driver;

    try {
      const s = await drv.getItem(key);
      if (s !== undefined) {
        const init = createEvent<S>();
        store.on(init, (_, s) => s);
        init(s);
      }
    } catch (e) {
      console.error("Failed to read from persistent key", key, e);
    }

    store.watch(async (s) => {
      try {
        await drv.setItem(key, s);
      } catch (e) {
        console.error("Failed to store persistent key", key, e);
      }
    });
  })();

  return store;
};
