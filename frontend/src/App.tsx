import "./i18n/init";
import { FC } from "react";
import { init } from "backend";
import { LevelsetEditor } from "components/levelset";
import { MainLayout } from "components/layout";
import { ErrorBoundary } from "components/page";
import { SettingsDialog } from "components/settings";
import { HotkeysManagerGate } from "models/ui/hotkeys";
import { PromptContainer, Toaster } from "ui/feedback";
import { PopupContainer } from "utils/react";

init();

export const App: FC = () => (
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
