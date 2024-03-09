import { renderPrompt } from "ui/feedback";
import { LevelEditProps } from "../types";
import { SpecPortsDbDialog } from "./SpecPortsDbDialog";
import { ISupaplexLevel } from "./types";

interface Options<L extends ISupaplexLevel> extends LevelEditProps<L> {}

export const showSpecPortsDbDialog = <L extends ISupaplexLevel>(
  o: Options<L>,
) => renderPrompt<void>((p) => <SpecPortsDbDialog {...o} {...p} />);
