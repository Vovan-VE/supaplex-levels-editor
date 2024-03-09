import cn from "classnames";
import { useUnit } from "effector-react";
import { FC, PropsWithChildren } from "react";
import { SpChipClassic, SpChipWinplex } from "drivers/supaplex/Tile";
import { $spChip } from "models/settings";
import { CmpLevelsDialog } from "../level/toolbars/EditToolbar/CmpLevels";
import * as compact from "./compact";
import * as full from "./full";
import { useFinalLayoutIsCompact } from "./useFinalLayoutIsCompact";
import cl from "./MainLayout.module.scss";

const CL_SP_CHIP = [SpChipClassic, SpChipWinplex];

export const MainLayout: FC<PropsWithChildren<object>> = ({ children }) => {
  const isCompact = useFinalLayoutIsCompact();
  const spChip = useUnit($spChip);

  return (
    <div
      className={cn(
        cl.root,
        isCompact ? cl._compact : cl._full,
        CL_SP_CHIP[spChip],
      )}
    >
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

      {/* REFACT: move somewhere */}
      <CmpLevelsDialog />
    </div>
  );
};
