import { useStore } from "effector-react";
import { FC, useCallback, useMemo, useState } from "react";
import { getDriver } from "drivers";
import { TileSelect } from "components/driver/TileSelect";
import { $currentDriverName } from "models/levelsets";
import { Button } from "ui/button";
import { svgs } from "ui/icon";
import { Field } from "ui/input";
import { ColorType } from "ui/types";
import { SelectionEditor, SelectionEditorProps } from "./_types";
import clC from "./common.module.scss";

const KEEP = <i>keep old</i>;

const ChessEditor: FC<SelectionEditorProps> = ({
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

  const [firstTile, setFirstTile] = useState<number>(-1);
  const [secondTile, setSecondTile] = useState<number>(-1);

  const handleSubmit = useCallback(() => {
    const { width, height } = tempLevel;
    onSubmit(
      tempLevel
        .batch((level) => {
          for (let j = height; j-- > 0; ) {
            for (let i = width; i-- > 0; ) {
              const tile = i % 2 === j % 2 ? firstTile : secondTile;
              if (tile >= 0) {
                level = level.setTile(i, j, tile);
              }
            }
          }
          return level;
        })
        .copyRegion({ x: 0, y: 0, width, height }),
    );
  }, [firstTile, secondTile, tempLevel, onSubmit]);

  return (
    <div>
      <div className={clC.row2}>
        <Field label="First tile">
          <TileSelect
            driverName={driverName as any}
            tile={firstTile}
            onChange={setFirstTile}
            canClear
            placeholder={KEEP}
          />
        </Field>
        <Field label="Second tile">
          <TileSelect
            driverName={driverName as any}
            tile={secondTile}
            onChange={setSecondTile}
            canClear
            placeholder={KEEP}
          />
        </Field>
      </div>

      <div className={clC.buttons}>
        <Button
          uiColor={ColorType.SUCCESS}
          onClick={handleSubmit}
          disabled={firstTile < 0 && secondTile < 0}
        >
          OK
        </Button>
        <Button onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
};

export const chess: SelectionEditor = {
  title: "Chess",
  icon: <svgs.Chess />,
  cannotWorkWhy: (s) =>
    s.width < 2 && s.height < 2 ? <>at least 2 tiles</> : null,
  Component: ChessEditor,
};
