import { base64Encode } from "utils/encoding/base64";
import { SaveFileAs } from "./bindings/github.com/vovan-ve/sple-desktop/app";

export const saveFileAs = async (data: Blob, filename: string) =>
  SaveFileAs(base64Encode(await data.arrayBuffer()), filename);
