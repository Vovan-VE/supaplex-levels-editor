import { IBaseLevel } from "drivers";
import { LevelBuffer } from "models/levelsets";
import { renderPrompt } from "ui/feedback";
import { LevelsOrder } from "./LevelsOrder";
import { Options } from "./types";

type I = LevelBuffer<IBaseLevel>;
type V = readonly I[];

export const promptLevelsOrder = (o: Options) =>
  renderPrompt<V>((p) => <LevelsOrder {...p} {...o} />);
