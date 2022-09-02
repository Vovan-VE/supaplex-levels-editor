import { FC } from "react";
import { useStore } from "effector-react";
import { Loading } from "components/page";
import { $currentBuffer, $currentKey } from "models/levelsets";
import { LevelsHead } from "../LevelsHead";
import cl from "./LevelsetEditor.module.scss";

export const LevelsetEditor: FC = () => {
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
      <div className={cl.editor}></div>
      <div className={cl.status}></div>
    </div>
  );
};
