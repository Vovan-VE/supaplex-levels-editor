import { Clipboard } from "@wailsio/runtime";

export function getClipboardText(): Promise<string> {
  return Clipboard.Text();
}

export function setClipboardText(text: string): Promise<boolean> {
  return Clipboard.SetText(text).then(() => true);
}
