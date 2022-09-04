import { useEffect, useState } from "react";
import { usePopupContainer } from "./usePopupContainer";

export interface PopupPortalOptions {
  className?: string;
}

export const usePopupPortal = ({ className }: PopupPortalOptions = {}) => {
  const [element, setElement] = useState<HTMLElement>();
  const getContainer = usePopupContainer();
  useEffect(() => {
    const container = getContainer();
    const doc = container.ownerDocument;
    const element = container.appendChild(doc.createElement("div"));
    setElement(element);
    return () => {
      setElement(undefined);
      container.removeChild(element);
    };
  }, [getContainer]);

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
