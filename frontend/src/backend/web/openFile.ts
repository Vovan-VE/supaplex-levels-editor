import { OpenFileOptions } from "../internal";

let prev: (() => void) | null = null;

export const openFile = ({ multiple, done }: OpenFileOptions) => {
  prev?.();

  const d = window.document;
  const input = d.createElement("input");
  input.setAttribute("type", "file");
  if (multiple) {
    input.setAttribute("multiple", "multiple");
  }
  input.style.visibility = "hidden";
  input.style.position = "absolute";
  d.body.appendChild(input);
  input.addEventListener("change", handler);
  prev = () => {
    input.removeEventListener("change", handler);
    input.parentNode?.removeChild(input);
    prev = null;
  };
  input.click();

  function handler() {
    const files = input.files;
    input.removeEventListener("change", handler);
    d.body.removeChild(input);
    if (files?.length) {
      done(Array.from(files, (file) => ({ file })));
    }
    prev?.();
  }
};
