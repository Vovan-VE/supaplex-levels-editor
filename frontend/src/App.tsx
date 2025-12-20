import "./i18n/init";
import cn from "classnames";
import { FC } from "react";
import { Classes, init } from "backend";
import { LevelsetEditor } from "components/levelset";
import { MainLayout } from "components/layout";
import { ErrorBoundary } from "components/page";
import { SettingsDialog } from "components/settings";
import { useSpChipClass } from "models/settings/sp-chip-class";
import { HotkeysManagerGate } from "models/ui/hotkeys";
import { useRootSetClasses } from "models/ui/useRootSetClasses";
import { PromptContainer, Toaster } from "ui/feedback";
import { PopupContainer } from "utils/react";

init();

interface Props {
  root: HTMLElement;
}

export const App: FC<Props> = ({ root }) => {
  useRootSetClasses(root, cn(Classes.app, useSpChipClass()));
  return (
    <ErrorBoundary>
      <PopupContainer>
        <HotkeysManagerGate />

        <MainLayout>
          <LevelsetEditor />
        </MainLayout>
        <SettingsDialog />
        <PromptContainer />
      </PopupContainer>
      <Toaster />
    </ErrorBoundary>
  );
};
