import { isNotNull } from "utils/fn";
import { OpenFileOptions } from "../internal";
import { fileRefToOpenFile } from "./fileRefToOpenFile";
import { OpenFile } from "./bindings/github.com/vovan-ve/sple-desktop/app";
import { WebFileRef } from "./bindings/github.com/vovan-ve/sple-desktop/internal/files/models";

export const openFile = async ({ multiple = false, done }: OpenFileOptions) => {
  try {
    const files: (WebFileRef | null)[] | null = await OpenFile(multiple);
    if (files?.length) {
      done(files.filter(isNotNull).map(fileRefToOpenFile));
    }
  } catch {}
};
