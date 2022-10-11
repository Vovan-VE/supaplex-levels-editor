import { createLocalStorageDriver } from "@cubux/storage-driver";
import { APP_STORAGE_PREFIX } from "configs";

export const localStorageDriver = createLocalStorageDriver<any>({
  prefix: APP_STORAGE_PREFIX,
});
