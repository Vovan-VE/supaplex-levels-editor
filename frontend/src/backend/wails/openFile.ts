import { base64Decode } from "utils/encoding/base64";
import { FilesStorageKey, OpenFileOptions } from "../internal";
import { OpenFile } from "./go/main/App";

export const openFile = ({ multiple = false, done }: OpenFileOptions) => {
  OpenFile(multiple).then((files) =>
    done(
      files.map((f) => ({
        file: new File([base64Decode(f.$$blob64)], f.name),
        key: f.$$id as FilesStorageKey,
      })),
    ),
  );
};
