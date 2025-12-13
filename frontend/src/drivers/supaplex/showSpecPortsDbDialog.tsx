import { renderPrompt } from "ui/feedback";
import { LevelEditProps } from "../types";
import { SpecPortsDbDialog } from "./SpecPortsDbDialog";
import { ISupaplexLevel } from "./types";

type Options<L extends ISupaplexLevel> = LevelEditProps<L>;

export const showSpecPortsDbDialog = <L extends ISupaplexLevel>(
  o: Options<L>,
) => renderPrompt<void>((p) => <SpecPortsDbDialog {...o} {...p} />);
