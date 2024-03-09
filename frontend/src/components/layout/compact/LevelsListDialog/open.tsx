import { renderPrompt } from "ui/feedback";
import { LevelsListDialog } from "./LevelsListDialog";

export const openLevelsListDialog = () =>
  renderPrompt((props) => <LevelsListDialog {...props} />);
