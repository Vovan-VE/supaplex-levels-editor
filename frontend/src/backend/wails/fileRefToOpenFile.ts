import { base64Decode } from "utils/encoding/base64";
import { FilesStorageKey, OpenFileItem } from "../internal";
import { WebFileRef } from "./bindings/github.com/vovan-ve/sple-desktop/internal/files/models";

export const fileRefToOpenFile = (f: WebFileRef): OpenFileItem => ({
  file: new File([base64Decode(f.$$blob64)], f.name),
  key: f.$$id as FilesStorageKey,
});
