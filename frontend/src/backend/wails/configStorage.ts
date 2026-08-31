import * as i from "../internal";
import {
  GetItem,
  RemoveItem,
  SetItem,
} from "./bindings/github.com/vovan-ve/sple-desktop/internal/backend/configstorage";

export const configStorage: i.ConfigStorage = {
  getItem: async (key: string): Promise<unknown> => {
    const r = await GetItem(key);
    return r ? JSON.parse(r.value) : undefined;
  },
  removeItem: RemoveItem,
  setItem: (key: string, value: unknown) => SetItem(key, JSON.stringify(value)),
};
