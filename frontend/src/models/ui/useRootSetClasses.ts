import { useEffect } from "react";

export function useRootSetClasses(root: HTMLElement, classes?: string | null) {
  const _classes = classes || "";
  useEffect(() => {
    if (!_classes) return;
    root.classList.add(_classes);
    return () => {
      root.classList.remove(_classes);
    };
  }, [root, _classes]);
}
