import { FC } from "react";
import { MainLayout } from "components/layout";
import cl from "./App.module.scss";

export const App: FC = () => (
  <MainLayout>
    <div className={cl.root}>
      {/*<div className={cl.testTiles}>*/}
      {/*  {SupaplexDriver.tiles.map(*/}
      {/*    (tile) => tile.Component && <tile.Component key={tile.value} />,*/}
      {/*  )}*/}
      {/*  {SupaplexDriver.unknownTile && <SupaplexDriver.unknownTile />}*/}
      {/*</div>*/}
    </div>
  </MainLayout>
);
