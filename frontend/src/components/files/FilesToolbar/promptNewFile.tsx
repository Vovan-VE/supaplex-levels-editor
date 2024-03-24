import { renderPrompt } from "ui/feedback";
import { NewFile } from "./NewFile";

export const promptNewFile = () =>
  renderPrompt((props) => <NewFile {...props} />);
