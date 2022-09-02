import { FC } from "react";
import { LevelsetEditor } from "components/levelset";
import { MainLayout } from "components/layout";

export const App: FC = () => (
  <MainLayout>
    <LevelsetEditor />

    {/*<div className={cl.testTiles}>*/}
    {/*  {SupaplexDriver.tiles.map(*/}
    {/*    (tile) => tile.Component && <tile.Component key={tile.value} />,*/}
    {/*  )}*/}
    {/*  {SupaplexDriver.unknownTile && <SupaplexDriver.unknownTile />}*/}
    {/*</div>*/}
  </MainLayout>
);
