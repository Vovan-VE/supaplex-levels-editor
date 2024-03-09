import { createEvent, createStore, sample } from "effector";
import { IBaseLevel } from "drivers";
import { HK_TOOL_FLOOD } from "models/ui/hotkeys-defined";
import { CellEventSnapshot } from "ui/grid-events";
import { svgs } from "ui/icon";
import { $currentLevel, updateCurrentLevel } from "../../levelsets";
import { $tileIndex } from "../current";
import { Tool, ToolUI } from "./interface";

const enum TO {
  UP,
  RIGHT,
  DOWN,
  LEFT,
  RETURN,
}
interface Trace {
  x: number;
  y: number;
  to: TO;
}

const floodFill = createEvent<CellEventSnapshot>();
sample({
  clock: floodFill,
  source: {
    level: $currentLevel,
    tile: $tileIndex,
  },
  filter: ({ level }, cell) => Boolean(level && cell.inBounds),
  fn: ({ level, tile }, cell) => {
    let next: IBaseLevel = level!.level.undoQueue.current;
    const prevTile = next.getTile(cell.x, cell.y);
    if (prevTile !== tile) {
      next = next.batch((next) => {
        const { width, height } = next;
        let _limit = width * height * 3;
        // TODO: better algorithm
        const stack: Trace[] = [{ x: cell.x, y: cell.y, to: TO.UP }];
        while (stack.length) {
          if (_limit <= 0) {
            // never happened
            throw new Error("Too long loop");
          }
          const point = stack[stack.length - 1];
          const { x, y, to } = point;
          --_limit;
          next = next.setTile(x, y, tile, true);

          if (to === TO.UP && y > 0 && next.getTile(x, y - 1) === prevTile) {
            point.to = TO.RIGHT;
            stack.push({ x, y: y - 1, to: TO.UP });
            continue;
          }
          if (
            to <= TO.RIGHT &&
            x + 1 < width &&
            next.getTile(x + 1, y) === prevTile
          ) {
            point.to = TO.DOWN;
            stack.push({ x: x + 1, y, to: TO.UP });
            continue;
          }
          if (
            to <= TO.DOWN &&
            y + 1 < height &&
            next.getTile(x, y + 1) === prevTile
          ) {
            point.to = TO.LEFT;
            stack.push({ x, y: y + 1, to: TO.RIGHT });
            continue;
          }
          if (to <= TO.LEFT && x > 0 && next.getTile(x - 1, y) === prevTile) {
            point.to = TO.RETURN;
            stack.push({ x: x - 1, y, to: TO.UP });
            continue;
          }

          stack.pop();
        }
        return next;
      });
    }
    return next;
  },
  target: updateCurrentLevel,
});

export const FLOOD: Tool = {
  internalName: "flood",
  variants: [
    {
      internalName: "d",
      title: (t) => t("main:drawing.FloodFill"),
      Icon: svgs.FloodFill,
      hotkey: HK_TOOL_FLOOD,
    },
  ],
  $ui: createStore<ToolUI>({
    events: {
      onClick: (e, cell) => {
        e.preventDefault();
        floodFill(cell);
      },
    },
  }),
};
