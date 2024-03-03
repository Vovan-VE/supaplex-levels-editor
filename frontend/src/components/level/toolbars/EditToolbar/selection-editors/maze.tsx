import { createEvent, restore } from "effector";
import { useUnit } from "effector-react";
import { FC, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { TileSelect } from "components/driver/TileSelect";
import { getDriver } from "drivers";
import { Trans } from "i18n/Trans";
import { $currentDriverName } from "models/levelsets";
import { HK_EDIT_MAZE } from "models/ui/hotkeys-defined";
import { Button } from "ui/button";
import { svgs } from "ui/icon";
import { Field, Range } from "ui/input";
import { ColorType } from "ui/types";
import * as MZ from "utils/maze";
import { elKeepOld } from "./_common";
import { SelectionEditor, SelectionEditorProps } from "./_types";
import clC from "./common.module.scss";

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
  const { t } = useTranslation();
  const driverName = useUnit($currentDriverName)!;
  const { tempLevelFromRegion } = getDriver(driverName)!;
  const tempLevel = useMemo(
    () => tempLevelFromRegion(region),
    [region, tempLevelFromRegion],
  );

  const mazeWidth = Math.floor((tempLevel.width + 1) / 2);
  const mazeHeight = Math.floor((tempLevel.height + 1) / 2);

  const wallTile = useUnit($wallTile);
  const wayTile = useUnit($wayTile);
  const branchLength = useUnit($branchLength);

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
        <Trans
          i18nKey="main:selectionEditors.maze.HintMazeSizeWillBe"
          values={{ width: mazeWidth, height: mazeHeight }}
        />
      </p>

      <div className={clC.row2}>
        <Field label={t("main:selectionEditors.maze.WallTile")}>
          <TileSelect
            driverName={driverName as any}
            tile={wallTile}
            onChange={setWallTile}
            canClear
            placeholder={elKeepOld}
          />
        </Field>
        <Field label={t("main:selectionEditors.maze.WayTile")}>
          <TileSelect
            driverName={driverName as any}
            tile={wayTile}
            onChange={setWayTile}
            canClear
            placeholder={elKeepOld}
          />
        </Field>
      </div>
      <Field
        label={t("main:selectionEditors.maze.BranchLength")}
        labelElement="div"
        help={<Trans i18nKey="main:selectionEditors.maze.BranchLengthHelp" />}
      >
        <Range
          min={1}
          max={50}
          value={branchLength}
          onChange={setBranchLength}
        />
      </Field>

      <p>
        <Trans i18nKey="main:selectionEditors.maze.HintOuterWallNotIncluded" />
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
          {t("main:common.buttons.OK")}
        </Button>
        <Button onClick={onCancel}>{t("main:common.buttons.Cancel")}</Button>
      </div>
    </div>
  );
};

export const maze: SelectionEditor = {
  title: <Trans i18nKey="main:selectionEditors.maze.Title" />,
  icon: <svgs.Maze />,
  cannotWorkWhy: (s) =>
    s.width < 3 || s.height < 3 ? (
      <Trans i18nKey="main:selectionEditors.maze.MinSizeRequire" />
    ) : null,
  Component: MazeEditor,
  hotkeys: HK_EDIT_MAZE,
};
