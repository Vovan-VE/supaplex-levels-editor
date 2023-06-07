import { base64Decode, base64Encode } from "utils/encoding/base64";
import * as i from "../internal";
import {
  GetAll,
  GetItem,
  RemoveItem,
  SetAll,
  SetItem,
} from "./go/backend/FilesStorage";
import { files } from "./go/models";

const i2r = (value: i.FilesStorageItem): files.Record => {
  const { key: k, fileBuffer, ...rest } = value;
  return {
    key: k,
    blob64: base64Encode(fileBuffer),
    options: Object.keys(rest).length ? JSON.stringify(rest) : "",
  };
};

const r2i = (r: files.Record): i.FilesStorageItem => ({
  ...(r.options ? JSON.parse(r.options) : null),
  key: r.key as i.FilesStorageKey,
  fileBuffer: base64Decode(r.blob64),
});

export const filesStorage: i.FilesStorage = {
  getItem: async (key: string): Promise<i.FilesStorageItem | undefined> => {
    const r = await GetItem(key);
    return r ? r2i(r) : undefined;
  },

  removeItem: RemoveItem,

  setItem: (key: string, value: i.FilesStorageItem): Promise<void> =>
    SetItem(key, i2r(value)),

  getAll: async (): Promise<ReadonlyMap<string, i.FilesStorageItem>> =>
    new Map(Object.entries(await GetAll()).map(([k, r]) => [k, r2i(r)])),

  setAll: (map: ReadonlyMap<string, i.FilesStorageItem>): Promise<void> =>
    SetAll(Object.fromEntries(Array.from(map).map(([k, v]) => [k, i2r(v)]))),
};
