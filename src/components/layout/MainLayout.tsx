import cn from "classnames";
import { useStore } from "effector-react";
import { FC, PropsWithChildren } from "react";
import { $layoutType, LayoutType } from "models/settings";
import { useMediaQueryState } from "ui/adaptive";
import * as compact from "./compact";
import * as full from "./full";
import cl from "./MainLayout.module.scss";

export const MainLayout: FC<PropsWithChildren<{}>> = ({ children }) => {
  const isCompact = useFinalLayoutType() === LayoutType.COMPACT;

  return (
    <div className={cn(cl.root, isCompact ? cl._compact : cl._full)}>
      {isCompact ? (
        <>
          <compact.Header className={cl.header} />
          <compact.Footer />
        </>
      ) : (
        <>
          <full.Header className={cl.header} />
          <full.Footer className={cl.footer} />
        </>
      )}
      <main className={cl.main}>{children}</main>
    </div>
  );
};

const useFinalLayoutType = () => {
  const layoutType = useStore($layoutType);
  const isAuto = layoutType === LayoutType.AUTO;
  const isLarge = useMediaQueryState({ adaptive: "lg", watch: isAuto });
  return isAuto ? (isLarge ? LayoutType.FULL : LayoutType.COMPACT) : layoutType;
};
