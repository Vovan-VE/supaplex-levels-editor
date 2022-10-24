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
  flushBuffers,
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
    function onSuspend() {
      flushBuffers();
    }
    function onVisChange() {
      if (window.document.visibilityState === "hidden") {
        flushBuffers();
      }
    }

    window.document.addEventListener("visibilitychange", onVisChange);
    window.addEventListener("pagehide", onSuspend);
    window.addEventListener("beforeunload", onSuspend);
    window.addEventListener("message", onMessage);

    return () => {
      window.removeEventListener("message", onMessage);
      window.removeEventListener("beforeunload", onSuspend);
      window.removeEventListener("pagehide", onSuspend);
      window.document.removeEventListener("visibilitychange", onVisChange);
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
