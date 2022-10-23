import { useStore } from "effector-react";
import { FC } from "react";
import { $opened, closeSettings } from "models/settings";
import { Button } from "ui/button";
import { Dialog } from "ui/feedback";
import { ColorType } from "ui/types";
import { CoordsChoice } from "./CoordsChoice";
import { Confirmations } from "./ConfirmCheckbox";
import { LayoutChoice } from "./LayoutChoice";

export const SettingsDialog: FC = () => {
  const opened = useStore($opened);

  return (
    <Dialog
      open={opened}
      title="Settings"
      onClose={closeSettings}
      size="small"
      buttons={
        <Button uiColor={ColorType.MUTE} onClick={closeSettings}>
          Close
        </Button>
      }
    >
      <LayoutChoice />
      <CoordsChoice />
      <Confirmations />
    </Dialog>
  );
};
