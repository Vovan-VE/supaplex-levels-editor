import { ReactElement } from "react";

type DialogContainerNode = {
  readonly index: number;
  render(node: ReactElement): void;
  delete(): void;
};

interface IContainer {
  add(): DialogContainerNode;
}

let container: IContainer | null = null;

export const getPromptContainer = () => {
  if (!container) {
    throw new Error(`PromptContainer does not exist`);
  }
  return container;
};

export const setContainer = (c: IContainer) => {
  container = c;
};

export const unsetContainer = () => {
  container = null;
};
