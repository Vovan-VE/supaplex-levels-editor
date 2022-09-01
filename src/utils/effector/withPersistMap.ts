import { createEvent, Store } from "effector";
import { PersistentStoreDriverAll } from "../store";

interface Options {
  /**
   * Debounce subsequent store updates and flush only after latest change
   */
  flushDelay?: number;
}

export const withPersistMap = <V>(
  store: Store<ReadonlyMap<string, V>>,
  driver: PersistentStoreDriverAll<V> | Promise<PersistentStoreDriverAll<V>>,
  { flushDelay = 5000 }: Options = {},
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

    {
      async function save(map: ReadonlyMap<string, V>) {
        try {
          await drv.setAll(map);
        } catch (e) {
          console.error("Failed to sync store into persistent", e);
        }
      }

      let tId: ReturnType<typeof setTimeout>;

      store.watch((map) => {
        clearTimeout(tId);
        tId = setTimeout(() => save(map), flushDelay);
      });
    }
  })();

  return store;
};
