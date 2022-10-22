import { FC } from "react";
import { LevelsetEditor } from "components/levelset";
import { MainLayout } from "components/layout";
import { ErrorBoundary } from "components/page";
import { SettingsDialog } from "components/settings";
import { PromptContainer } from "ui/feedback";
import { PopupContainer } from "utils/react";

export const App: FC = () => (
  <ErrorBoundary>
    <PopupContainer>
      <MainLayout>
        <LevelsetEditor />
      </MainLayout>
      <SettingsDialog />
      <PromptContainer />
    </PopupContainer>
  </ErrorBoundary>
);
