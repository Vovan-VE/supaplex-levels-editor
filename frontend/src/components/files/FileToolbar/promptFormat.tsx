import { renderPrompt } from "ui/feedback";
import { SelectFormat } from "./SelectFormat";

export const promptFormat = () =>
  renderPrompt<string>((props) => <SelectFormat {...props} />);
