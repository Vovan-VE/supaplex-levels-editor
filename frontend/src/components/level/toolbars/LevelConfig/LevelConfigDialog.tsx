import { FC } from "react";
import { Button } from "ui/button";
import { Dialog, renderPrompt, RenderPromptProps } from "ui/feedback";
import { ColorType } from "ui/types";
import { LevelConfig } from "./LevelConfig";
import { LevelDriverConfig } from "./LevelDriverConfig";
import cl from "./LevelConfigDialog.module.scss";

interface Props extends RenderPromptProps<true | undefined> {}

const LevelConfigDialog: FC<Props> = ({ show, onSubmit }) => {
  return (
    <Dialog
      open={show}
      onClose={onSubmit}
      buttons={
        <Button uiColor={ColorType.MUTE} onClick={() => onSubmit()}>
          Close
        </Button>
      }
      title="Level settings"
    >
      <div className={cl.root}>
        <LevelConfig onDidResize={onSubmit} />
        <LevelDriverConfig />
      </div>
    </Dialog>
  );
};

export const promptLevelConfig = () =>
  renderPrompt((props) => <LevelConfigDialog {...props} />);
