import { useStore } from "effector-react";
import { FC, useCallback, useMemo, useState } from "react";
import { TileSelect } from "components/driver/TileSelect";
import { getDriver, getTilesVariantsMap } from "drivers";
import { $currentDriverName } from "models/levelsets";
import { Button } from "ui/button";
import { svgs } from "ui/icon";
import { Checkbox, Field } from "ui/input";
import { ColorType } from "ui/types";
import { SelectionEditor, SelectionEditorProps } from "./_types";
import clC from "./common.module.scss";

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

  const [searchTile, setSearchTile] = useState<number>(-1);
  const [replaceTile, setReplaceTile] = useState<number>(-1);
  const [keepVariants, setKeepVariants] = useState(true);

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
      <div>
        <Checkbox checked={keepVariants} onChange={setKeepVariants}>
          Keep tile variants
        </Checkbox>
      </div>

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
};
