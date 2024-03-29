import cn from "classnames";
import { useUnit } from "effector-react";
import { FC, Fragment } from "react";
import { useTranslation } from "react-i18next";
import GitHubLogo from "assets/img/github.svg?react";
import { showInfoDialog, ZoomButtons } from "components/common";
import { EditorTabs, FilesToolbar, FileToolbar } from "components/files";
import {
  EditToolbar,
  SelectionEditHotKeys,
  SelectionEditMenu,
  UndoButton,
} from "components/level/toolbars/EditToolbar";
import { promptLevelConfig } from "components/level/toolbars/LevelConfig";
import { FlushIndicator, LevelsTabs, LevelsToolbar } from "components/levelset";
import { APP_VERSION, REPO_URL } from "configs";
import {
  $currentBufferLevelsCount,
  $currentBufferSelected,
  $currentKey,
  $currentLevelIndex,
} from "models/levelsets";
import { openSettings } from "models/settings";
import {
  Button,
  ButtonDropdown,
  TextButton,
  Toolbar,
  ToolbarSeparator,
} from "ui/button";
import { IconStackType, svgs } from "ui/icon";
import { ColorType, ContainerProps } from "ui/types";
import { openLevelsListDialog } from "./LevelsListDialog";
import { ToolButton } from "./ToolButton";
import { TilesButton } from "./TilesButton";
import cl from "./Header.module.scss";

const MUTE = ColorType.MUTE;

interface Props extends ContainerProps {}

export const Header: FC<Props> = (props) => {
  const { t } = useTranslation();
  const key = useUnit($currentKey);
  const levelsetReady = useUnit($currentBufferSelected);
  const levelsetLevelsCount = useUnit($currentBufferLevelsCount);
  const levelIndex = useUnit($currentLevelIndex);

  return (
    <header {...props}>
      <Toolbar className={cl.root}>
        <ButtonDropdown triggerIcon={<svgs.FileBin />} noArrow>
          <div className={cl.popupPanel}>
            <Toolbar>
              <FilesToolbar />
              <ToolbarSeparator />
              <FileToolbar isCompact />
            </Toolbar>
            <EditorTabs className={cl.scrollableList} />
          </div>
        </ButtonDropdown>
        {levelsetReady && key && (
          <Fragment key={key}>
            <ButtonDropdown triggerIcon={<svgs.ListOrdered />} noArrow>
              <div className={cl.popupPanel}>
                <Toolbar>
                  <Button icon={<svgs.Menu />} onClick={openLevelsListDialog}>
                    x{levelsetLevelsCount}
                  </Button>
                  <LevelsToolbar isCompact />
                </Toolbar>
                <LevelsTabs className={cn(cl.scrollableList, cl.levelsList)} />
              </div>
            </ButtonDropdown>
            {levelIndex !== null && (
              <Fragment key={levelIndex}>
                <ToolButton />
                <TilesButton />
                <SelectionEditHotKeys />
                <ButtonDropdown standalone={<UndoButton />}>
                  <Toolbar>
                    <EditToolbar isCompact />
                    <Button
                      icon={<svgs.Wrench />}
                      iconStack={[[IconStackType.Index, <svgs.Rename />]]}
                      onClick={promptLevelConfig}
                    />
                  </Toolbar>
                  <SelectionEditMenu />
                </ButtonDropdown>
              </Fragment>
            )}
          </Fragment>
        )}
        <span className={cl.space} />
        <FlushIndicator />
        <ZoomButtons />
        <ButtonDropdown triggerIcon={<svgs.Menu />} noArrow>
          <Toolbar isMenu className={cl.popupToolbar}>
            <TextButton
              uiColor={MUTE}
              icon={<svgs.Wrench />}
              onClick={openSettings}
            >
              {t("main:common.buttons.Settings")}
            </TextButton>
            <TextButton
              href={REPO_URL}
              target="_blank"
              rel="noopener"
              uiColor={MUTE}
              icon={<GitHubLogo />}
            >
              {t("main:common.buttons.GitHubRepo")}
            </TextButton>
            <TextButton
              uiColor={MUTE}
              icon={<svgs.Info />}
              onClick={showInfoDialog}
            >
              {t("main:common.buttons.Info")}{" "}
              <span className={cl.ver}>v{APP_VERSION}</span>
            </TextButton>
          </Toolbar>
        </ButtonDropdown>
      </Toolbar>
    </header>
  );
};
