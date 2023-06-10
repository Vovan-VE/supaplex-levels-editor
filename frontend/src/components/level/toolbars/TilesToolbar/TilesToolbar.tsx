import { FC, Fragment, useMemo } from "react";
import cn from "classnames";
import { useStore } from "effector-react";
import { getTilesForToolbar } from "drivers";
import { $drvTileRender, $drvTiles, $tileIndex, setTile } from "models/levels";
import { TextButton, Toolbar } from "ui/button";
import { ColorType, ContainerProps } from "ui/types";
import cl from "./TilesToolbar.module.scss";

interface Props extends ContainerProps {}

export const TilesToolbar: FC<Props> = ({ className, ...rest }) => {
  const TileRender = useStore($drvTileRender)!;
  const tiles = useStore($drvTiles)!;
  const tilesSorted = useMemo(
    () =>
      getTilesForToolbar(tiles).filter(
        ([, { value, metaTile }]) =>
          !metaTile || metaTile.primaryValue === value,
      ),
    [tiles],
  );

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
      {tilesSorted.map(([i, { title, value, metaTile }]) => (
        <Fragment key={value}>
          {i > 0 && <wbr />}
          <TextButton
            title={metaTile?.title ?? title}
            icon={metaTile?.icon ?? <TileRender tile={value} />}
            className={cn(cl.btn, i === tileIndex && cl._current)}
            uiColor={ColorType.WARN}
            onClick={handleTile[i]}
          />
        </Fragment>
      ))}
    </Toolbar>
  );
};