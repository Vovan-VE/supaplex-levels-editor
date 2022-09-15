import { FC, useEffect } from "react";
import { useStore } from "effector-react";
import { Loading } from "components/page";
import { $currentBuffer, $currentKey, flushBuffers } from "models/levelsets";
import { LevelsHead } from "../LevelsHead";
import { LevelEditor } from "../LevelEditor";
import cl from "./LevelsetEditor.module.scss";

export const LevelsetEditor: FC = () => {
  useEffect(() => {
    let fired = false;
    function flushOnce() {
      if (!fired) {
        fired = true;
        flushBuffers();
      }
    }
    function onVisChange() {
      if (window.document.visibilityState === "hidden") {
        flushOnce();
      }
    }

    window.document.addEventListener("visibilitychange", onVisChange);
    window.addEventListener("pagehide", flushOnce);
    window.addEventListener("beforeunload", flushOnce);

    return () => {
      window.removeEventListener("beforeunload", flushOnce);
      window.removeEventListener("pagehide", flushOnce);
      window.document.removeEventListener("visibilitychange", onVisChange);
    };
  }, []);

  const key = useStore($currentKey);
  const levelset = useStore($currentBuffer);

  if (!key) {
    return null;
  }
  if (!levelset) {
    return <Loading />;
  }

  return (
    <div className={cl.root}>
      <LevelsHead key={key} className={cl.levels} />
      <LevelEditor className={cl.editor} />
    </div>
  );
};
