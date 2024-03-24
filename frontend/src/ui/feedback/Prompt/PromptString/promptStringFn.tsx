import { renderPrompt } from "../renderPrompt";
import { PromptString, PromptStringOptions } from "./PromptString";

export const promptString = (options?: PromptStringOptions) =>
  renderPrompt<string>((props) => <PromptString {...props} {...options} />);
