import { createContext } from "react";

interface IGetPopupContainer {
  (): HTMLElement;
}

export const Context = createContext<IGetPopupContainer>(() => document.body);
