import { renderPrompt } from "ui/feedback";
import { LevelConfigDialog } from "./LevelConfigDialog";

export const promptLevelConfig = () =>
  renderPrompt((props) => <LevelConfigDialog {...props} />);
