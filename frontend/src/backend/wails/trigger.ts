import { createEvent } from "effector";

export const onExitDirty = createEvent<any>();
export const onShowError = createEvent<string>();

export const spleFrontError = createEvent<void>();

const enum FrontEventType {
  ExitDirty = "exitDirty",
  ShowError = "showError",
}
interface FrontEvent<K extends FrontEventType, V = null> {
  type: K;
  data: V;
}
type FrontEvents =
  | FrontEvent<FrontEventType.ExitDirty>
  | FrontEvent<FrontEventType.ShowError, string>;

export const spleFrontEvent = (e: FrontEvents) => {
  switch (e.type) {
    case FrontEventType.ExitDirty:
      onExitDirty();
      return;

    case FrontEventType.ShowError:
      onShowError(e.data);
      return;
  }
};
