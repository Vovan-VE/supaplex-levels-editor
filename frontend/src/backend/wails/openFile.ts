import { OpenFileOptions } from "../internal";
import { fileRefToOpenFile } from "./fileRefToOpenFile";
import { OpenFile } from "./go/main/App";
import { files } from "./go/models";

export const openFile = async ({ multiple = false, done }: OpenFileOptions) => {
  let files: files.WebFileRef[] | null = null;
  try {
    files = await OpenFile(multiple);
    if (files?.length) {
      done(files.map(fileRefToOpenFile));
    }
  } catch {}
};
