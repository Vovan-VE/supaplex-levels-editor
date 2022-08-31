export interface PersistentStoreDriverSingle<T> {
  getItem(key: string): Promise<T | undefined>;
  removeItem(key: string): Promise<void>;
  setItem(key: string, value: T): Promise<void>;
}

export interface PersistentStoreDriverAll<T> {
  getAll(): Promise<ReadonlyMap<string, T>>;
  setAll(items: ReadonlyMap<string, T>): Promise<void>;
}

export interface PersistentStoreDriver<T>
  extends PersistentStoreDriverSingle<T>,
    PersistentStoreDriverAll<T> {}
