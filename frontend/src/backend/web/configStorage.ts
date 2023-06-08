import { createLocalStorageDriver } from "@cubux/storage-driver";
import { APP_STORAGE_PREFIX } from "../config";

export const configStorage = createLocalStorageDriver<any>({
  prefix: APP_STORAGE_PREFIX,
});
