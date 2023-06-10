import { createEvent, restore } from "effector";
import { useStore } from "effector-react";
import { FC, useCallback, useMemo } from "react";
import { TileSelect } from "components/driver/TileSelect";
import { getDriver } from "drivers";
import { $currentDriverName } from "models/levelsets";
import { HotKeyMask } from "models/ui/hotkeys";
import { Button } from "ui/button";
import { svgs } from "ui/icon";
import { Field, Range } from "ui/input";
import { ColorType } from "ui/types";
import * as MZ from "utils/maze";
import { SelectionEditor, SelectionEditorProps } from "./_types";
import clC from "./common.module.scss";

const KEEP = <i>keep old</i>;

// The underlying low-level maze has zero-width walls:
//
//     +--+--+--+
//     |  |     |
//     +  +  +--+
//     |        |
//     +--+--+--+
//
// So, it can be represented in SP only by letting every wall occupy separate
// tile:
//
//     #######
//     # #   #
//     # # ###
//     #     #
//     #######

const setWallTile = createEvent<number>();
const setWayTile = createEvent<number>();
const setBranchLength = createEvent<number>();
const $wallTile = restore(setWallTile, -1);
const $wayTile = restore(setWayTile, -1);
const $branchLength = restore(setBranchLength, 20);

const MazeEditor: FC<SelectionEditorProps> = ({
  region,
  onSubmit,
  onCancel,
}) => {
  const driverName = useStore($currentDriverName)!;
  const { tempLevelFromRegion } = getDriver(driverName)!;
  const tempLevel = useMemo(
    () => tempLevelFromRegion(region),
    [region, tempLevelFromRegion],
  );

  const mazeWidth = Math.floor((tempLevel.width + 1) / 2);
  const mazeHeight = Math.floor((tempLevel.height + 1) / 2);

  const wallTile = useStore($wallTile);
  const wayTile = useStore($wayTile);
  const branchLength = useStore($branchLength);

  const handleSubmit = useCallback(() => {
    const { width, height } = tempLevel;
    const maze = MZ.generate(mazeWidth, mazeHeight, branchLength);
    onSubmit(
      tempLevel
        .batch((level) => {
          if (wallTile >= 0) {
            for (let y = 1; y < height; y += 2) {
              for (let x = 1; x < width; x += 2) {
                level = level.setTile(x, y, wallTile, true);
              }
            }
          }
          if (wayTile >= 0) {
            for (let y = 0; y < height; y += 2) {
              for (let x = 0; x < width; x += 2) {
                level = level.setTile(x, y, wayTile, true);
              }
            }
          }
          MZ.forEachCell(maze, ({ x, y, walls }) => {
            if (y > 0) {
              const tile = walls.has(MZ.Direction.TOP) ? wallTile : wayTile;
              if (tile >= 0) {
                level = level.setTile(x * 2, y * 2 - 1, tile, true);
              }
            }
            if (x > 0) {
              const tile = walls.has(MZ.Direction.LEFT) ? wallTile : wayTile;
              if (tile >= 0) {
                level = level.setTile(x * 2 - 1, y * 2, tile, true);
              }
            }
          });
          return level;
        })
        .copyRegion({ x: 0, y: 0, width, height }),
    );
  }, [
    wallTile,
    wayTile,
    branchLength,
    tempLevel,
    mazeWidth,
    mazeHeight,
    onSubmit,
  ]);

  return (
    <div>
      <p>
        Maze size is <strong>{mazeWidth}</strong>x<strong>{mazeHeight}</strong>{" "}
        of "way" columns/rows.
      </p>

      <div className={clC.row2}>
        <Field label="Wall tile">
          <TileSelect
            driverName={driverName as any}
            tile={wallTile}
            onChange={setWallTile}
            canClear
            placeholder={KEEP}
          />
        </Field>
        <Field label="Way tile">
          <TileSelect
            driverName={driverName as any}
            tile={wayTile}
            onChange={setWayTile}
            canClear
            placeholder={KEEP}
          />
        </Field>
      </div>
      <Field
        label="Branch length"
        labelElement="div"
        help={
          <>
            It's technical option which could be called "Difficulty".
            <br />
            The higher value, the longer "ways" could be generated in theory.
            However, in practice all large values behaves the same after some
            threshold, because every branch generated just randomly.
          </>
        }
      >
        <Range
          min={1}
          max={50}
          value={branchLength}
          onChange={setBranchLength}
        />
      </Field>

      <p>
        <strong>NOTICE:</strong> The <em>Outer Wall</em> is not included
        (compared to WpColEd), so the top left cell in the selection is a "way"
        cell. You can first create a "room" border of any tiles, and then fill
        its "content" with a maze.
      </p>

      <div className={clC.buttons}>
        <Button
          uiColor={ColorType.SUCCESS}
          onClick={handleSubmit}
          disabled={
            (wallTile < 0 && wayTile < 0) ||
            branchLength === null ||
            branchLength <= 0
          }
        >
          OK
        </Button>
        <Button onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
};

export const maze: SelectionEditor = {
  title: "Maze",
  icon: <svgs.Maze />,
  cannotWorkWhy: (s) =>
    s.width < 3 || s.height < 3 ? <>at least 3x3</> : null,
  Component: MazeEditor,
  hotkeys: ["M", HotKeyMask.SHIFT],
};