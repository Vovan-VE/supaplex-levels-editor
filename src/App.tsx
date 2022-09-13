import { FC } from "react";
import { LevelsetEditor } from "components/levelset";
import { MainLayout } from "components/layout";
import { ErrorBoundary } from "components/page";
import { PromptContainer } from "ui/feedback";
import { PopupContainer } from "utils/react";

export const App: FC = () => (
  <ErrorBoundary>
    <PopupContainer>
      <MainLayout>
        <LevelsetEditor />
      </MainLayout>
      <PromptContainer />
    </PopupContainer>
  </ErrorBoundary>
);
