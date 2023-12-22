import { FC, useEffect } from "react";
import { useUnit } from "effector-react";
import { NoFileSelected, NoLevelSelected } from "components/common";
import { LevelBody } from "components/level/body";
import { Loading } from "components/page";
import { TEST_MESSAGE_ORIGIN } from "configs";
import {
  $currentBufferSelected,
  $currentKey,
  $currentLevelIndex,
} from "models/levelsets";
import { receivedDemoFromTest } from "models/levelsets/demo";
import cl from "./LevelsetEditor.module.scss";

export const LevelsetEditor: FC = () => {
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.origin === TEST_MESSAGE_ORIGIN) {
        receivedDemoFromTest(e.data);
      }
    }

    window.addEventListener("message", onMessage);

    return () => {
      window.removeEventListener("message", onMessage);
    };
  }, []);

  const key = useUnit($currentKey);
  const levelsetReady = useUnit($currentBufferSelected);
  const levelIndex = useUnit($currentLevelIndex);

  if (!key) {
    return <NoFileSelected className={cl.root} />;
  }
  if (!levelsetReady) {
    return <Loading className={cl.root} />;
  }
  if (levelIndex === null) {
    return <NoLevelSelected className={cl.root} />;
  }
  return <LevelBody key={`${key}:${levelIndex}`} className={cl.root} />;
};
