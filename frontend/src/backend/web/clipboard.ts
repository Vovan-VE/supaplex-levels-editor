export const getClipboardText = async () => {
  try {
    return await window.navigator.clipboard.readText();
  } catch (e) {
    const note = e instanceof Error ? ` (${e.message})` : "";
    console.error("navigator.clipboard.readText():", e);
    const s = window.prompt(
      `No access or support for clipboard${note}\n\nPaste here:`,
    );
    return s === null ? Promise.reject(new Error("User cancel")) : s;
  }
};

export const setClipboardText = async (text: string) => {
  try {
    await window.navigator.clipboard.writeText(text);
  } catch (e) {
    const note = e instanceof Error ? ` (${e.message})` : "";
    console.error("navigator.clipboard.writeText():", e);
    window.prompt(
      `No access or support for clipboard${note}\n\nCopy this:`,
      text,
    );
  }
};
