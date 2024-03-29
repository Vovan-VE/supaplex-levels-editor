import { useUnit } from "effector-react";
import { FC } from "react";
import { TilesToolbar } from "components/level/toolbars/TilesToolbar";
import { getDriver } from "drivers";
import { $tileIndex } from "models/levels";
import { $currentDriverName } from "models/levelsets";
import { ButtonDropdown } from "ui/button";
import cl from "./TilesButton.module.scss";

export const TilesButton: FC = () => {
  const driverName = useUnit($currentDriverName)!;
  const { TileRender } = getDriver(driverName)!;

  const tileIndex = useUnit($tileIndex);

  return (
    <ButtonDropdown
      triggerIcon={<TileRender tile={tileIndex} />}
      buttonClassName={cl.button}
      noArrow
    >
      <TilesToolbar />
    </ButtonDropdown>
  );
};
