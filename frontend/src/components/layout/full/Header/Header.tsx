import { useStore } from "effector-react";
import { FC, Fragment } from "react";
import { EditorTabs, FilesToolbar, FileToolbar } from "components/files";
import { LevelsHead } from "components/layout/full/Header/LevelsHead";
import { LevelToolbars } from "components/level/toolbars/LevelToolbars";
import { FlushIndicator } from "components/levelset";
import {
  $currentBufferSelected,
  $currentKey,
  $currentLevelIndex,
} from "models/levelsets";
import { Toolbar } from "ui/button";
import { ContainerProps } from "ui/types";
import cl from "./Header.module.scss";

interface Props extends ContainerProps {}

export const Header: FC<Props> = (props) => {
  const key = useStore($currentKey);
  const levelsetReady = useStore($currentBufferSelected);
  const levelIndex = useStore($currentLevelIndex);

  return (
    <header {...props}>
      <div className={cl.files}>
        <Toolbar className={cl.start}>
          <FilesToolbar />
        </Toolbar>
        <EditorTabs className={cl.tabs} />
        <FlushIndicator className={cl.flush} />
        <Toolbar className={cl.end}>
          <FileToolbar />
        </Toolbar>
      </div>
      {levelsetReady && key && (
        <Fragment key={key}>
          <LevelsHead />
          {levelIndex !== null && <LevelToolbars key={levelIndex} />}
        </Fragment>
      )}
    </header>
  );
};
