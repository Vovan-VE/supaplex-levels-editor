import { base64Decode } from "utils/encoding/base64";
import { FilesStorageKey, OpenFileOptions } from "../internal";
import { OpenFile } from "./go/main/App";
import { files } from "./go/models";

export const openFile = async ({ multiple = false, done }: OpenFileOptions) => {
  let files: files.WebFileRef[] | null = null;
  try {
    files = await OpenFile(multiple);
    if (files?.length) {
      done(
        files.map((f) => ({
          file: new File([base64Decode(f.$$blob64)], f.name),
          key: f.$$id as FilesStorageKey,
        })),
      );
    }
  } catch {}
};
