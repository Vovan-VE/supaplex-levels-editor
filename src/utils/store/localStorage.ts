import { PersistentStoreDriver } from "./types";

interface Options {
  storage?: Storage;
  prefix?: string;
}
interface OptionsStrict extends Required<Options> {}

const KS = ":";

export async function createLS<T>(options: Options) {
  return new PersistentLocalStorage<T>({
    // ...options,
    storage: options.storage ?? window.localStorage,
    prefix: options.prefix ?? "persistent",
  });
}

class PersistentLocalStorage<T> implements PersistentStoreDriver<T> {
  #opt: OptionsStrict;

  constructor(options: OptionsStrict) {
    this.#opt = options;
  }

  async getAll(): Promise<ReadonlyMap<string, T>> {
    const { storage, prefix } = this.#opt;
    const prefixKS = prefix + KS;
    const prefixSkip = prefixKS.length;

    const items = new Map<string, T>();
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && key.startsWith(prefixKS)) {
        items.set(key.substring(prefixSkip), JSON.parse(storage.get(key)));
      }
    }
    return items;
  }

  async getItem(key: string): Promise<T | undefined> {
    const { storage, prefix } = this.#opt;

    const v = storage.getItem(prefix + KS + key);
    if (v !== null) {
      return JSON.parse(v);
    }
  }

  async removeItem(key: string): Promise<void> {
    const { storage, prefix } = this.#opt;

    storage.removeItem(prefix + KS + key);
  }

  async setAll(items: ReadonlyMap<string, T>): Promise<void> {
    const { storage, prefix } = this.#opt;
    const prefixKS = prefix + KS;
    const prefixSkip = prefixKS.length;

    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (
        key &&
        key.startsWith(prefixKS) &&
        !items.has(key.substring(prefixSkip))
      ) {
        storage.removeItem(key);
      }
    }
    for (const [key, value] of items) {
      storage.setItem(prefix + KS + key, JSON.stringify(value));
    }
  }

  async setItem(key: string, value: T): Promise<void> {
    const { storage, prefix } = this.#opt;

    storage.setItem(prefix + KS + key, JSON.stringify(value));
  }
}
