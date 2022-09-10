import { createLocalStorageDriver } from "@cubux/storage-driver";

export const localStorageDriver = createLocalStorageDriver<any>({
  prefix: "sp-ed",
});
