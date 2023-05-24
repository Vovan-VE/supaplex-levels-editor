import { useStore } from "effector-react";
import { FC } from "react";
import { allowManualSave } from "backend";
import { $opened, closeSettings } from "models/settings";
import { Button } from "ui/button";
import { Dialog } from "ui/feedback";
import { ColorType } from "ui/types";
import { AutoSave } from "./AutoSave";
import { CoordsChoice } from "./CoordsChoice";
import { LayoutChoice } from "./LayoutChoice";
import { SpChips } from "./SpChips";

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
      {allowManualSave && <AutoSave />}
      <LayoutChoice />
      <CoordsChoice />
      {/*<Confirmations />*/}
      <SpChips />
    </Dialog>
  );
};
