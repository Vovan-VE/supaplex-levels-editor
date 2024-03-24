import { renderPrompt } from "ui/feedback";
import { ResizeLevel } from "./ResizeLevel";

export const promptResizeLevel = () =>
  renderPrompt((props) => <ResizeLevel {...props} />);
