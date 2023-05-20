interface OpenFileOptions {
  multiple?: boolean;
  done: (files: FileList) => void;
}

export const openFile = ({ multiple, done }: OpenFileOptions) => {
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
  input.click();

  function handler() {
    const files = input.files;
    input.removeEventListener("change", handler);
    d.body.removeChild(input);
    if (files) {
      done(files);
    }
  }
};
