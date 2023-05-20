// start with cross-tabs semaphore first
import "models/instanceSemaphore";

import { FC } from "react";
import { LevelsetEditor } from "components/levelset";
import { MainLayout } from "components/layout";
import { ErrorBoundary } from "components/page";
import { SettingsDialog } from "components/settings";
import { HotkeysManagerGate } from "models/ui/hotkeys";
import { PromptContainer, Toaster } from "ui/feedback";
import { PopupContainer } from "utils/react";

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
