import { useStore } from "effector-react";
import { $layoutType, LayoutType } from "models/settings";
import { useMediaQueryState } from "ui/adaptive";

export const useFinalLayoutIsCompact = () => {
  const layoutType = useStore($layoutType);
  const isAuto = layoutType === LayoutType.AUTO;
  const isLarge = useMediaQueryState({ adaptive: "lg", watch: isAuto });
  return isAuto ? !isLarge : layoutType === LayoutType.COMPACT;
};
