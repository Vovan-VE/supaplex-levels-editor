import { OpenFileOptions } from "../internal";

export const openFile = ({ multiple, done }: OpenFileOptions) => {
  const d = window.document;
  const i = d.createElement("input");

  function destroy() {
    i.removeEventListener("change", handleChange);
    i.removeEventListener("cancel", handleCancel);
    i.parentNode?.removeChild(i);
  }
  function handleChange() {
    const files = i.files;
    if (files?.length) {
      done(Array.from(files, (file) => ({ file })));
    }
    destroy();
  }
  function handleCancel() {
    // onCancel?.();
    destroy();
  }

  try {
    i.setAttribute("type", "file");
    if (multiple) {
      i.setAttribute("multiple", "multiple");
    }
    // for (const [k, v] of Object.entries(attrs)) {
    //   if (v === false) continue;
    //   if (v === true) {
    //     i.setAttribute(k, k);
    //     continue;
    //   }
    //   i.setAttribute(k, v);
    // }

    i.style.position = "absolute";
    i.style.left = "0";
    i.style.bottom = "200vh";
    i.style.opacity = "0";

    // https://developer.mozilla.org/en-US/docs/web/api/htmlelement/cancel_event
    // > It is also fired by the file input when the user cancels the file
    // > picker dialog via the Esc key or the cancel button and when the user
    // > re-selects the same files that were previously selected.
    i.addEventListener("cancel", handleCancel);
    i.addEventListener("change", handleChange);
    d.body.appendChild(i);

    i.click();
  } catch {
    handleCancel();
  }
};
