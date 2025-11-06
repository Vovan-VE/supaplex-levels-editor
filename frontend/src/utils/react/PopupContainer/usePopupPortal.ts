import { useEffect, useMemo } from "react";
import { usePopupContainer } from "./usePopupContainer";

export interface PopupPortalOptions {
  className?: string;
}

export const usePopupPortal = ({ className }: PopupPortalOptions = {}) => {
  const getContainer = usePopupContainer();
  const container = getContainer();
  const element = useMemo(() => {
    const doc = container.ownerDocument;
    return container.appendChild(doc.createElement("div"));
  }, [container]);
  useEffect(() => {
    return () => {
      element.parentElement?.removeChild(element);
    };
  }, [element]);

  useEffect(() => {
    if (element && className) {
      try {
        element.classList.add(className);
      } catch (e) {
        console.error("Cannot add class", { className }, e);
        return;
      }
      return () => {
        element.classList.remove(className);
      };
    }
  }, [element, className]);

  return element;
};
