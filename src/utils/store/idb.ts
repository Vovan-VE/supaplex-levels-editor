import { PersistentStoreDriver } from "./types";

interface Options {
  dbName: string;
  dbVersion?: number;
  table: string;
}
interface OptionsStrict extends Required<Options> {}

const F_KEY = "key";
const F_VALUE = "value";

export function createIDB<T>(options: Options) {
  const opt: OptionsStrict = { ...options, dbVersion: options.dbVersion ?? 1 };

  return new Promise<PersistentStoreDriver<T>>((resolve, reject) => {
    function onerror() {
      reject(new Error("Could not load database"));
    }

    const r = window.indexedDB.open(opt.dbName, opt.dbVersion);
    r.onerror = onerror;
    r.onupgradeneeded = () => {
      const db = r.result;
      db.onerror = onerror;
      db.createObjectStore(opt.table, { keyPath: F_KEY });
    };
    r.onsuccess = () => resolve(new PersistentIDB<T>(r.result, opt));
  });
}

class PersistentIDB<T> implements PersistentStoreDriver<T> {
  #db: IDBDatabase;
  #opt: OptionsStrict;

  constructor(db: IDBDatabase, options: OptionsStrict) {
    this.#db = db;
    this.#opt = options;
  }

  getAll(): Promise<ReadonlyMap<string, T>> {
    return new Promise((resolve, reject) => {
      const items = new Map<string, T>();

      const r = this.#db
        .transaction(this.#opt.table)
        .objectStore(this.#opt.table)
        .openCursor();

      r.onerror = () =>
        reject(new Error("Could not read database object store"));

      r.onsuccess = () => {
        const cursor = r.result;
        if (cursor) {
          const v = cursor.value;
          items.set(v[F_KEY], v[F_VALUE]);
          cursor.continue();
        } else {
          resolve(items);
        }
      };
    });
  }

  getItem(key: string): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      const r = this.#db
        .transaction(this.#opt.table)
        .objectStore(this.#opt.table)
        .openCursor(key);

      r.onerror = () =>
        reject(new Error("Could not read database object store"));

      r.onsuccess = () => {
        const cursor = r.result;
        if (cursor) {
          const v = cursor.value;
          resolve(v[F_VALUE]);
        } else {
          resolve(undefined);
        }
      };
    });
  }

  removeItem(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const r = this.#db
        .transaction(this.#opt.table, "readwrite")
        .objectStore(this.#opt.table)
        .delete(key);

      r.onerror = () =>
        reject(new Error("Could not write database object store"));

      r.onsuccess = () => resolve();
    });
  }

  setAll(items: ReadonlyMap<string, T>): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const tr = this.#db.transaction(this.#opt.table, "readwrite");

      tr.onerror = () => reject(new Error("Database transaction failed"));
      tr.oncomplete = () => resolve();

      const store = tr.objectStore(this.#opt.table);

      const toDelete = await new Promise<readonly string[]>((res) => {
        const toDelete: string[] = [];
        const r = store.openCursor();

        r.onerror = () =>
          reject(new Error("Could not read database object store"));

        r.onsuccess = () => {
          const cursor = r.result;
          if (cursor) {
            const v = cursor.value;
            toDelete.push(v[F_KEY]);
            cursor.continue();
          } else {
            res(toDelete);
          }
        };
      });

      for (const r of [
        ...toDelete.map((key) => store.delete(key)),
        ...[...items].map(([key, value]) =>
          store.put({ [F_KEY]: key, [F_VALUE]: value }),
        ),
      ]) {
        r.onerror = () =>
          reject(new Error("Could not write database object store"));
      }
    });
  }

  setItem(key: string, value: T): Promise<void> {
    return new Promise((resolve, reject) => {
      const r = this.#db
        .transaction(this.#opt.table, "readwrite")
        .objectStore(this.#opt.table)
        .put({
          [F_KEY]: key,
          [F_VALUE]: value,
        });

      r.onerror = () =>
        reject(new Error("Could not write database object store"));

      r.onsuccess = () => resolve();
    });
  }
}
