import { useStore } from "effector-react";
import { FC, Fragment } from "react";
import { FilesToolbar } from "components/files/FilesToolbar";
import { FileToolbar } from "components/files/FileToolbar";
import { LevelsHead } from "components/levelset/LevelsHead";
import { LevelToolbars } from "components/level/toolbars/LevelToolbars";
import {
  $currentBufferSelected,
  $currentKey,
  $currentLevelIndex,
} from "models/levelsets";
import { ContainerProps } from "ui/types";
import { EditorTabs } from "./EditorTabs";
import cl from "./Header.module.scss";

interface Props extends ContainerProps {}

export const Header: FC<Props> = (props) => {
  const key = useStore($currentKey);
  const levelsetReady = useStore($currentBufferSelected);
  const levelIndex = useStore($currentLevelIndex);

  return (
    <header {...props}>
      <div className={cl.files}>
        <FilesToolbar className={cl.start} />
        <EditorTabs className={cl.tabs} />
        <FileToolbar className={cl.end} />
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
