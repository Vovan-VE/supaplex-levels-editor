import { FC } from "react";
import { LevelsetEditor } from "components/levelset";
import { MainLayout } from "components/layout";
import { PopupContainer } from "utils/react";

export const App: FC = () => (
  <PopupContainer>
    <MainLayout>
      <LevelsetEditor />

      {/*<div className={cl.testTiles}>*/}
      {/*  {SupaplexDriver.tiles.map(*/}
      {/*    (tile) => tile.Component && <tile.Component key={tile.value} />,*/}
      {/*  )}*/}
      {/*  {SupaplexDriver.unknownTile && <SupaplexDriver.unknownTile />}*/}
      {/*</div>*/}
    </MainLayout>
  </PopupContainer>
);
