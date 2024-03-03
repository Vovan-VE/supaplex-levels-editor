import cn from "classnames";
import { useUnit } from "effector-react";
import { FC } from "react";
import { TileCoords } from "components/settings/display";
import { $feedbackCell } from "models/levels/tools";
import { $currentLevelUndoQueue } from "models/levelsets";
import { ContainerProps } from "ui/types";
import { inBounds } from "utils/rect";
import cl from "./HoveredCell.module.scss";

export const HoveredCell: FC<ContainerProps> = (props) => {
  const feedback = useUnit($feedbackCell);
  const level = useUnit($currentLevelUndoQueue)?.current;
  if (!feedback) {
    return null;
  }
  const { x, y } = feedback;
  return (
    <span {...props} className={cn(cl.root, props.className)}>
      <span>
        <TileCoords x={x} y={y} />
      </span>
      {level && inBounds(x, y, level) && (
        <DisplayTileHex tile={level.getTile(x, y)} />
      )}
    </span>
  );
};

const DisplayTileHex: FC<{ tile: number }> = ({ tile }) => {
  const replacedChar = replaceChars.get(tile);
  return (
    <>
      <span className={cl.hex}>
        <code>{tile.toString(16).toUpperCase().padStart(2, "0")}</code>
        <sub>h</sub>
      </span>
      <span className={cl.char}>
        {replacedChar ? (
          <span className={cl.replaced}>{replacedChar}</span>
        ) : (
          <code>{String.fromCharCode(tile)}</code>
        )}
      </span>
    </>
  );
};

const replaceChars = new Map([
  [0x00, "␀"],
  [0x01, "␁"],
  [0x02, "␂"],
  [0x03, "␃"],
  [0x04, "␄"],
  [0x05, "␅"],
  [0x06, "␆"],
  [0x07, "␇"],
  [0x08, "␈"],
  [0x09, "␉"],
  [0x0a, "␊"],
  [0x0b, "␋"],
  [0x0c, "␌"],
  [0x0d, "␍"],
  [0x0e, "␎"],
  [0x0f, "␏"],
  [0x10, "␐"],
  [0x11, "␑"],
  [0x12, "␒"],
  [0x13, "␓"],
  [0x14, "␔"],
  [0x15, "␕"],
  [0x16, "␖"],
  [0x17, "␗"],
  [0x18, "␘"],
  [0x19, "␙"],
  [0x1a, "␚"],
  [0x1b, "␛"],
  [0x1c, "␜"],
  [0x1d, "␝"],
  [0x1e, "␞"],
  [0x1f, "␟"],
  [0x20, "␠"],
  [0x7f, "␡"],
]);
