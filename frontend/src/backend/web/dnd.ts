import { createEvent } from "effector";
import { OpenFiles } from "../internal";

export const onOpenFile = createEvent<OpenFiles>();

export function init() {
  function handlePrevent(e: DragEvent) {
    e.preventDefault();
  }
  function handleDrop(e: DragEvent) {
    e.preventDefault();
    const files = e.dataTransfer?.files;
    //console.info("on drop", e, files && Array.from(files));
    if (files?.length) {
      onOpenFile(Array.from(files, (file) => ({ file })));
    }
  }

  const b = window.document.body;
  b.addEventListener("dragover", handlePrevent);
  b.addEventListener("drop", handleDrop);
}
