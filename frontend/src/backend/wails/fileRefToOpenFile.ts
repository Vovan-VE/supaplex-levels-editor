import { base64Decode } from "utils/encoding/base64";
import { FilesStorageKey, OpenFileItem } from "../internal";
import { files } from "./go/models";

export const fileRefToOpenFile = (f: files.WebFileRef): OpenFileItem => ({
  file: new File([base64Decode(f.$$blob64)], f.name),
  key: f.$$id as FilesStorageKey,
});
