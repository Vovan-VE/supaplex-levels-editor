import cn from "classnames";
import { FC, PropsWithChildren } from "react";
import * as compact from "./compact";
import * as full from "./full";
import { useFinalLayoutIsCompact } from "./useFinalLayoutIsCompact";
import cl from "./MainLayout.module.scss";

export const MainLayout: FC<PropsWithChildren<{}>> = ({ children }) => {
  const isCompact = useFinalLayoutIsCompact();

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
