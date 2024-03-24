import { FC } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "ui/button";
import { Dialog, RenderPromptProps } from "ui/feedback";
import { ColorType } from "ui/types";
import { LevelConfig } from "./LevelConfig";
import { LevelDriverConfig } from "./LevelDriverConfig";
import cl from "./LevelConfigDialog.module.scss";

interface Props extends RenderPromptProps<true | undefined> {}

export const LevelConfigDialog: FC<Props> = ({ show, onSubmit }) => {
  const { t } = useTranslation();
  return (
    <Dialog
      open={show}
      onClose={onSubmit}
      buttons={
        <Button uiColor={ColorType.MUTE} onClick={() => onSubmit()}>
          {t("main:common.buttons.Close")}
        </Button>
      }
      title={t("main:level.config.DialogTitle")}
    >
      <div className={cl.root}>
        <LevelConfig onDidResize={onSubmit} />
        <LevelDriverConfig />
      </div>
    </Dialog>
  );
};
