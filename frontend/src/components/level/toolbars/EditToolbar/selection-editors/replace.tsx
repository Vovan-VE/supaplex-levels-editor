import { createEvent, restore } from "effector";
import { useStore } from "effector-react";
import { FC, useCallback, useMemo } from "react";
import { TileSelect } from "components/driver/TileSelect";
import { getDriver, getTilesVariantsMap } from "drivers";
import { $currentDriverName } from "models/levelsets";
import { HK_EDIT_REPLACE } from "models/ui/hotkeys-defined";
import { Button } from "ui/button";
import { svgs } from "ui/icon";
import { Checkbox, Field } from "ui/input";
import { ColorType } from "ui/types";
import { SelectionEditor, SelectionEditorProps } from "./_types";
import clC from "./common.module.scss";

const setSearchTile = createEvent<number>();
const setReplaceTile = createEvent<number>();
const setKeepVariants = createEvent<boolean>();
const $searchTile = restore(setSearchTile, -1);
const $replaceTile = restore(setReplaceTile, -1);
const $keepVariants = restore(setKeepVariants, true);

const ReplaceEditor: FC<SelectionEditorProps> = ({
  region,
  onSubmit,
  onCancel,
}) => {
  const driverName = useStore($currentDriverName)!;
  const { tempLevelFromRegion, tiles } = getDriver(driverName)!;
  const tempLevel = useMemo(
    () => tempLevelFromRegion(region),
    [region, tempLevelFromRegion],
  );
  const tileVariants = useMemo(() => getTilesVariantsMap(tiles), [tiles]);

  const searchTile = useStore($searchTile);
  const replaceTile = useStore($replaceTile);
  const keepVariants = useStore($keepVariants);

  const handleSubmit = useCallback(() => {
    const { width, height } = tempLevel;
    onSubmit(
      tempLevel
        .batch((level) => {
          for (let j = height; j-- > 0; ) {
            for (let i = width; i-- > 0; ) {
              let prev = level.getTile(i, j);
              if (keepVariants) {
                prev = tileVariants.get(prev) ?? prev;
              }
              if (prev === searchTile) {
                level = level.setTile(i, j, replaceTile, keepVariants);
              }
            }
          }
          return level;
        })
        .copyRegion({ x: 0, y: 0, width, height }),
    );
  }, [
    searchTile,
    replaceTile,
    keepVariants,
    tileVariants,
    tempLevel,
    onSubmit,
  ]);

  return (
    <div>
      <div className={clC.row2}>
        <Field label="Search what">
          <TileSelect
            driverName={driverName as any}
            tile={searchTile}
            onChange={setSearchTile}
          />
        </Field>
        <Field label="Replace with">
          <TileSelect
            driverName={driverName as any}
            tile={replaceTile}
            onChange={setReplaceTile}
          />
        </Field>
      </div>
      {(tileVariants.has(searchTile) || tileVariants.has(replaceTile)) && (
        <div>
          <Checkbox checked={keepVariants} onChange={setKeepVariants}>
            Keep tile variants
          </Checkbox>
        </div>
      )}

      <div className={clC.buttons}>
        <Button
          uiColor={ColorType.SUCCESS}
          onClick={handleSubmit}
          disabled={searchTile < 0 || replaceTile < 0}
        >
          OK
        </Button>
        <Button onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
};

export const replace: SelectionEditor = {
  title: "Replace",
  icon: <svgs.Replace />,
  Component: ReplaceEditor,
  hotkeys: HK_EDIT_REPLACE,
};
