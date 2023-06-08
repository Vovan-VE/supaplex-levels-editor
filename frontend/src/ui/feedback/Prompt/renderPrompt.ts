import { ReactElement } from "react";
import { getPromptContainer } from "./PromptContainer";

export interface RenderPromptProps<V> {
  show: boolean;
  onSubmit: undefined extends V ? (value?: V) => void : (value: V) => void;
  onCancel: () => void;
}

export interface RenderPromptCallback<V> {
  (props: RenderPromptProps<V>): ReactElement;
}

export interface RenderPromptOptions {
  destroyDelay?: number;
}

const noop = () => {};

export const renderPrompt = async <V = true | undefined>(
  renderPrompt: RenderPromptCallback<V>,
  { destroyDelay = 1000 }: RenderPromptOptions = {},
): Promise<undefined extends V ? V | true | undefined : V | undefined> => {
  const container = getPromptContainer().add();
  try {
    return await new Promise((resolve) => {
      container.render(
        renderPrompt({
          show: true,
          onSubmit: (value = true as const as any) => resolve(value),
          onCancel: () => resolve(undefined),
        }),
      );
    });
  } finally {
    try {
      container.render(
        renderPrompt({
          show: false,
          onSubmit: noop,
          onCancel: noop,
        }),
      );
    } catch {}
    setTimeout(() => container.delete(), destroyDelay);
  }
};
