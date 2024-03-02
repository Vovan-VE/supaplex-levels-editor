import { createEvent, restore } from "effector";
import { useUnit } from "effector-react";
import { FC, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { TileSelect, TileSelectMulti } from "components/driver/TileSelect";
import { getDriver, getTilesVariantsMap } from "drivers";
import { Trans } from "i18n/Trans";
import { $currentDriverName } from "models/levelsets";
import { HK_EDIT_REPLACE } from "models/ui/hotkeys-defined";
import { Button } from "ui/button";
import { svgs } from "ui/icon";
import { Checkbox, Field } from "ui/input";
import { ColorType } from "ui/types";
import { SelectionEditor, SelectionEditorProps } from "./_types";
import clC from "./common.module.scss";

const setSearchTiles = createEvent<readonly number[]>();
const setReplaceTile = createEvent<number>();
const setKeepVariants = createEvent<boolean>();
const $searchTiles = restore(
  setSearchTiles.map((v) => new Set(v)),
  new Set<number>(),
);
const $replaceTile = restore(setReplaceTile, -1);
const $keepVariants = restore(setKeepVariants, true);

const ReplaceEditor: FC<SelectionEditorProps> = ({
  region,
  onSubmit,
  onCancel,
}) => {
  const { t } = useTranslation();
  const driverName = useUnit($currentDriverName)!;
  const { tempLevelFromRegion, tiles } = getDriver(driverName)!;
  const tempLevel = useMemo(
    () => tempLevelFromRegion(region),
    [region, tempLevelFromRegion],
  );
  const tileVariants = useMemo(() => getTilesVariantsMap(tiles), [tiles]);

  const searchTiles = useUnit($searchTiles);
  const replaceTile = useUnit($replaceTile);
  const keepVariants = useUnit($keepVariants);

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
              if (searchTiles.has(prev)) {
                level = level.setTile(i, j, replaceTile, keepVariants);
              }
            }
          }
          return level;
        })
        .copyRegion({ x: 0, y: 0, width, height }),
    );
  }, [
    searchTiles,
    replaceTile,
    keepVariants,
    tileVariants,
    tempLevel,
    onSubmit,
  ]);

  return (
    <div>
      <div className={clC.row2}>
        <Field
          label={t("main:selectionEditors.replace.SearchWhat")}
          help={t(
            "main:selectionEditors.replace.SearchWhatHelp",
            "Multiple allowed",
          )}
        >
          <TileSelectMulti
            driverName={driverName as any}
            tile={searchTiles}
            onChange={setSearchTiles}
          />
        </Field>
        <Field label={t("main:selectionEditors.replace.ReplaceWith")}>
          <TileSelect
            driverName={driverName as any}
            tile={replaceTile}
            onChange={setReplaceTile}
          />
        </Field>
      </div>
      {(tileVariants.has(replaceTile) ||
        Array.from(searchTiles).some((v) => tileVariants.has(v))) && (
        <div>
          <Checkbox checked={keepVariants} onChange={setKeepVariants}>
            {t("main:selectionEditors.replace.KeepTileVariants")}
          </Checkbox>
        </div>
      )}

      <div className={clC.buttons}>
        <Button
          uiColor={ColorType.SUCCESS}
          onClick={handleSubmit}
          disabled={!searchTiles.size || replaceTile < 0}
        >
          {t("main:common.buttons.OK")}
        </Button>
        <Button onClick={onCancel}>{t("main:common.buttons.Cancel")}</Button>
      </div>
    </div>
  );
};

export const replace: SelectionEditor = {
  title: <Trans i18nKey="main:selectionEditors.replace.Title" />,
  icon: <svgs.Replace />,
  Component: ReplaceEditor,
  hotkeys: HK_EDIT_REPLACE,
};
