import { createIndexedDBDriver, createNullDriver } from "@cubux/storage-driver";
import { APP_STORAGE_PREFIX } from "../config";

export const filesStorage =
  process.env.NODE_ENV === "test"
    ? createNullDriver<string, any>()
    : createIndexedDBDriver<string, any>({
        dbName: APP_STORAGE_PREFIX,
        dbVersion: 1,
        table: "levelset-files",
      });
