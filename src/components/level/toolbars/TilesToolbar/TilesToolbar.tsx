import { FC, Fragment, useMemo } from "react";
import cn from "classnames";
import { useStore } from "effector-react";
import { getDriver, getTilesForToolbar } from "drivers";
import { $tileIndex, setTile } from "models/levels";
import { $currentDriverName } from "models/levelsets";
import { Button, Toolbar } from "ui/button";
import { ContainerProps } from "ui/types";
import cl from "./TilesToolbar.module.scss";

interface Props extends ContainerProps {}

export const TilesToolbar: FC<Props> = ({ className, ...rest }) => {
  const driverName = useStore($currentDriverName)!;
  const { tiles, TileRender } = getDriver(driverName)!;
  const tilesSorted = useMemo(() => getTilesForToolbar(tiles), [tiles]);

  const tileIndex = useStore($tileIndex);
  const handleTile = useMemo(
    () =>
      Array.from({ length: tiles.length }).map((_, n) => () => {
        setTile(n);
      }),
    [tiles.length],
  );

  return (
    <Toolbar {...rest} className={cn(cl.root, className)}>
      {tilesSorted.map(([i, { title, value }]) => (
        <Fragment key={value ?? `?${i}`}>
          {i > 0 && <wbr />}
          <Button
            title={title}
            icon={<TileRender tile={value} />}
            className={cl.btn}
            asLink={i !== tileIndex}
            onClick={handleTile[i]}
          />
        </Fragment>
      ))}
    </Toolbar>
  );
};
