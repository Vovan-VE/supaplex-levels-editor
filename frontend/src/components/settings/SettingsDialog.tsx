import { useUnit } from "effector-react";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import { allowManualSave } from "backend";
import { $opened, closeSettings } from "models/settings";
import { Button } from "ui/button";
import { Dialog } from "ui/feedback";
import { ColorType } from "ui/types";
import { AutoSave } from "./AutoSave";
import { CoordsChoice } from "./CoordsChoice";
import { LanguageSelect } from "./LanguageSelect";
import { LayoutChoice } from "./LayoutChoice";
import { SpChips } from "./SpChips";

export const SettingsDialog: FC = () => {
  const { t } = useTranslation();
  const opened = useUnit($opened);

  return (
    <Dialog
      open={opened}
      title={t("main:settings.DialogTitle")}
      onClose={closeSettings}
      size="small"
      buttons={
        <Button uiColor={ColorType.MUTE} onClick={closeSettings}>
          {t("main:common.buttons.Close")}
        </Button>
      }
    >
      {allowManualSave && <AutoSave />}
      <LayoutChoice />
      <CoordsChoice />
      {/*<Confirmations />*/}
      <SpChips />
      <LanguageSelect />
    </Dialog>
  );
};
