import { forwardRef, useContext } from "react";
import { TileCoords } from "components/settings/display";
import { TextButton } from "ui/button";
import { svgs } from "ui/icon";
import { SortableItemProps } from "ui/list";
import { InlineTile } from "../InlineTile";
import { ISupaplexSpecPortRecord } from "../internal";
import { CLevel } from "./context";
import cl from "./Item.module.scss";

export const Item = forwardRef<
  HTMLDivElement,
  SortableItemProps<ISupaplexSpecPortRecord>
>(({ item, itemProps, handleProps, index }, ref) => {
  const level = useContext(CLevel)!;
  // TODO: level.getTileVariant()
  const [[, , , tile, variant]] = level.tilesRenderStream(item.x, item.y, 1, 1);
  return (
    <div ref={ref} {...itemProps} className={cl.item}>
      <span className={cl.index}>{index + 1}.</span>
      <span className={cl.tile}>
        <InlineTile tile={tile} variant={variant} />
      </span>
      <span className={cl.xy}>
        <TileCoords x={item.x} y={item.y} />
      </span>
      <span className={cl.g}>g{item.gravity}</span>
      <span className={cl.z}>z{item.freezeZonks}</span>
      <span className={cl.e}>e{item.freezeEnemies}</span>
      <span className={cl.u}>u{item.unusedByte}</span>
      {/* TODO: <span>{item.isStdCompatible(width) && 'STD'}</span>*/}
      <TextButton
        icon={<svgs.DragV />}
        {...handleProps}
        className={cl.handle}
      />
    </div>
  );
});
