import { createEvent, restore } from "effector";
import { useUnit } from "effector-react";
import { FC, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { TileSelect } from "components/driver/TileSelect";
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
  const { t } = useTranslation();
  const driverName = useUnit($currentDriverName)!;
  const { tempLevelFromRegion, tiles } = getDriver(driverName)!;
  const tempLevel = useMemo(
    () => tempLevelFromRegion(region),
    [region, tempLevelFromRegion],
  );
  const tileVariants = useMemo(() => getTilesVariantsMap(tiles), [tiles]);

  const searchTile = useUnit($searchTile);
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
        <Field label={t("main:selectionEditors.replace.SearchWhat")}>
          <TileSelect
            driverName={driverName as any}
            tile={searchTile}
            onChange={setSearchTile}
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
      {(tileVariants.has(searchTile) || tileVariants.has(replaceTile)) && (
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
          disabled={searchTile < 0 || replaceTile < 0}
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
