import { createLocalStorageDriver } from "@cubux/storage-driver";
import { APP_STORAGE_PREFIX } from "../config";

export const configStorage = createLocalStorageDriver<unknown>({
  prefix: APP_STORAGE_PREFIX,
});
