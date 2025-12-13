import { createIndexedDBDriver, createNullDriver } from "@cubux/storage-driver";
import { APP_STORAGE_PREFIX } from "../config";
import { FilesStorageItem } from "../internal";

export const filesStorage =
  import.meta.env.MODE === "test"
    ? createNullDriver<string, FilesStorageItem>()
    : createIndexedDBDriver<string, FilesStorageItem>({
        dbName: APP_STORAGE_PREFIX,
        dbVersion: 1,
        table: "levelset-files",
      });
