import { FC, Fragment, useMemo } from "react";
import { useTranslation } from "react-i18next";
import cn from "classnames";
import { useUnit } from "effector-react";
import { getTilesForToolbar } from "drivers";
import { $drvTileRender, $drvTiles, $tileIndex, setTile } from "models/levels";
import { $currentFileRo } from "models/levelsets";
import { TextButton, Toolbar } from "ui/button";
import { ColorType, ContainerProps } from "ui/types";
import cl from "./TilesToolbar.module.scss";

interface Props extends ContainerProps {}

export const TilesToolbar: FC<Props> = ({ className, ...rest }) => {
  const { t } = useTranslation();
  const isRo = useUnit($currentFileRo);
  const TileRender = useUnit($drvTileRender)!;
  const tiles = useUnit($drvTiles)!;
  const tilesSorted = useMemo(
    () =>
      getTilesForToolbar(tiles).filter(
        ([, { value, metaTile }]) =>
          !metaTile || metaTile.primaryValue === value,
      ),
    [tiles],
  );

  const tileIndex = useUnit($tileIndex);
  const handleTile = useMemo(
    () =>
      isRo
        ? []
        : Array.from({ length: tiles.length }).map((_, n) => () => {
            setTile(n);
          }),
    [tiles.length, isRo],
  );

  return (
    <Toolbar {...rest} className={cn(cl.root, className)}>
      {tilesSorted.map(([i, { title, value, metaTile }]) => (
        <Fragment key={value}>
          {i > 0 && <wbr />}
          <TextButton
            title={(metaTile?.title ?? title)(t)}
            icon={metaTile?.icon ?? <TileRender tile={value} />}
            className={cn(cl.btn, i === tileIndex && cl._current)}
            uiColor={ColorType.WARN}
            onClick={handleTile[i]}
            disabled={isRo}
          />
        </Fragment>
      ))}
    </Toolbar>
  );
};
