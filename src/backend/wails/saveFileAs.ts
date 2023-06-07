import { base64Encode } from "utils/encoding/base64";
import { SaveFileAs } from "./go/main/App";

export const saveFileAs = async (data: Blob, filename: string) =>
  SaveFileAs(base64Encode(await data.arrayBuffer()), filename);
