import * as i from "../internal";
import { GetItem, RemoveItem, SetItem } from "./go/backend/ConfigStorage";

export const configStorage: i.ConfigStorage = {
  getItem: async (key: string): Promise<any> => {
    const r = await GetItem(key);
    return r ? JSON.parse(r.value) : undefined;
  },
  removeItem: RemoveItem,
  setItem: (key: string, value: any) => SetItem(key, JSON.stringify(value)),
};
