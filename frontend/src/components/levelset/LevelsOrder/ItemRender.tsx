import { IBaseLevel } from "drivers";
import { LevelBuffer } from "models/levelsets";
import { TextButton } from "ui/button";
import { svgs } from "ui/icon";
import { SortableItemComponent } from "ui/list";
import cl from "./ItemRender.module.scss";

export const ItemRender: SortableItemComponent<
  LevelBuffer<IBaseLevel>,
  HTMLDivElement
> = ({
  ref,
  item: {
    undoQueue: { current: level },
  },
  itemProps,
  handleProps,
  index,
}) => (
  <div ref={ref} {...itemProps} className={cl.item}>
    <div className={cl.index}>{index + 1}</div>
    <div className={cl.title}>{level.title}</div>
    <TextButton {...handleProps} icon={<svgs.DragV />} className={cl.handle} />
  </div>
);
