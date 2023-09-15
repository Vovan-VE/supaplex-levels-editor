import { createEvent } from "effector";

export const onExitDirty = createEvent<any>();
export const onShowError = createEvent<string>();
export const onUpgradeAvailable = createEvent<string>();

const enum FrontEventType {
  ExitDirty = "exitDirty",
  ShowError = "showError",
  UpgradeAvailable = "upgradeAvailable",
}

export const frontEventsHandlers: Record<string, (data?: any) => void> = {
  [FrontEventType.ExitDirty]: onExitDirty,
  [FrontEventType.ShowError]: onShowError,
  [FrontEventType.UpgradeAvailable]: onUpgradeAvailable,
};
