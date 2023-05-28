import { FC, useEffect } from "react";
import { useStore } from "effector-react";
import { NoFileSelected, NoLevelSelected } from "components/common";
import { LevelBody } from "components/level/body";
import { Loading } from "components/page";
import { TEST_MESSAGE_ORIGIN } from "configs";
import {
  $currentBufferSelected,
  $currentKey,
  $currentLevelIndex,
  useBeforeUnloadHandling,
} from "models/levelsets";
import { receivedDemoFromTest } from "models/levelsets/demo";
import cl from "./LevelsetEditor.module.scss";

export const LevelsetEditor: FC = () => {
  useBeforeUnloadHandling();
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

  const key = useStore($currentKey);
  const levelsetReady = useStore($currentBufferSelected);
  const levelIndex = useStore($currentLevelIndex);

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
