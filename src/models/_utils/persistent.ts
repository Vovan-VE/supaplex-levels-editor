import { createLocalStorageDriver } from "@cubux/storage-driver";
import { APP_NAME } from "configs";

export const localStorageDriver = createLocalStorageDriver<any>({
  prefix: APP_NAME,
});
