import { createLocalStorageDriver } from "@cubux/storage-driver";

export const localStorageDriver = createLocalStorageDriver({
  prefix: "sp-ed",
});
