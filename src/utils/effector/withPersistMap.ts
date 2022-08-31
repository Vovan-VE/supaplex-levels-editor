import { createEvent, Store } from "effector";
import { PersistentStoreDriverAll } from "../store";

export const withPersistMap = <V>(
  store: Store<ReadonlyMap<string, V>>,
  driver: PersistentStoreDriverAll<V> | Promise<PersistentStoreDriverAll<V>>,
) => {
  (async () => {
    const drv = await driver;

    try {
      const map = await drv.getAll();
      if (map !== undefined) {
        const init = createEvent<ReadonlyMap<string, V>>();
        store.on(init, (_, s) => s);
        init(map);
      }
    } catch (e) {
      console.error("Failed to read all from persistent", e);
    }

    store.watch(async (map) => {
      try {
        await drv.setAll(map);
      } catch (e) {
        console.error("Failed to sync store into persistent", e);
      }
    });
  })();

  return store;
};
