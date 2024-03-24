import { combine, createEvent, restore } from "effector";
import { useUnit } from "effector-react";
import { ChangeEvent, FC, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import * as RoSet from "@cubux/readonly-set";
import { TileSelect, TileSelectMulti } from "components/driver/TileSelect";
import { getDriver, getTilesVariantsMap } from "drivers";
import { Trans } from "i18n/Trans";
import { $currentDriverName } from "models/levelsets";
import { Button } from "ui/button";
import { Checkbox, Field, Input } from "ui/input";
import { ColorType } from "ui/types";
import { SelectionEditorProps } from "./_types";
import clC from "./common.module.scss";

const EMPTY_SET_N: ReadonlySet<number> = new Set();
const ALL_BYTES = Array.from({ length: 256 }, (_, i) => i);

const setSearchTiles = createEvent<readonly number[]>();
const setSearchHexText = createEvent<ChangeEvent<HTMLInputElement>>();
const setReplaceTile = createEvent<number>();
const setSearchUnknown = createEvent<boolean>();
const setKeepVariants = createEvent<boolean>();
const $searchTiles = restore<ReadonlySet<number>>(
  setSearchTiles.map((v) => new Set(v)),
  EMPTY_SET_N,
);
const $searchHexText = restore(
  setSearchHexText.map((e) => e.target.value),
  "",
);
const $searchHex = $searchHexText.map((input) => {
  const nums = new Set<number>();
  for (const range of input.split(/[;,\s]+/u)) {
    if (!range) continue;
    const m = range.match(/^([\da-f]*)(?:\.\.([\da-f]*))?$/i);
    if (!m) return { error: err("invalid", range) };
    const [, as, bs] = m;
    const a = as ? parseInt(as, 16) : 0;
    const b = bs ? parseInt(bs, 16) : 255;
    if (a >= b) return { error: err("a >= b", range) };
    for (let i = a; i <= b; i++) {
      nums.add(i);
    }
  }
  return { nums };
});
const $searchAll = combine($searchTiles, $searchHex, (tiles, { nums: hex }) => {
  let res = tiles;
  if (hex?.size) res = RoSet.union(res, hex);
  return res;
});
const $searchUnknown = restore(setSearchUnknown, false);
const $replaceTile = restore(setReplaceTile, -1);
const $keepVariants = restore(setKeepVariants, true);

const err = (reason: string, code: string) => (
  <>
    {reason}: <code>{code}</code>
  </>
);

export const ReplaceEditor: FC<SelectionEditorProps> = ({
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
  const unknownTiles = useMemo(
    () =>
      tiles.reduce((s, { value }) => {
        s.delete(value);
        return s;
      }, new Set(ALL_BYTES)),
    [tiles],
  );

  const searchTiles = useUnit($searchTiles);
  const searchHexText = useUnit($searchHexText);
  const searchHex = useUnit($searchHex);
  const searchUnknown = useUnit($searchUnknown);
  const searchAllChosen = useUnit($searchAll);
  const searchAll = useMemo(
    () =>
      searchUnknown
        ? RoSet.union(searchAllChosen, unknownTiles)
        : searchAllChosen,
    [searchAllChosen, unknownTiles, searchUnknown],
  );
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
              if (searchAll.has(prev)) {
                level = level.setTile(i, j, replaceTile, keepVariants);
              }
            }
          }
          return level;
        })
        .copyRegion({ x: 0, y: 0, width, height }),
    );
  }, [searchAll, replaceTile, keepVariants, tileVariants, tempLevel, onSubmit]);

  return (
    <div>
      <div className={clC.row2}>
        <div>
          <Field
            label={t("main:selectionEditors.replace.SearchWhat")}
            help={t("main:selectionEditors.replace.SearchWhatHelp")}
          >
            <TileSelectMulti
              driverName={driverName as any}
              tile={searchTiles}
              onChange={setSearchTiles}
            />
          </Field>
          <Field
            label={t("main:selectionEditors.replace.SearchWhatHex")}
            help={
              <Trans i18nKey="main:selectionEditors.replace.SearchWhatHexHelp" />
            }
            error={searchHex.error}
          >
            <Input value={searchHexText} onChange={setSearchHexText} />
          </Field>
          <div>
            <Checkbox checked={searchUnknown} onChange={setSearchUnknown}>
              {t("main:selectionEditors.replace.SearchUnknown")}
            </Checkbox>
          </div>
        </div>

        <div>
          <Field label={t("main:selectionEditors.replace.ReplaceWith")}>
            <TileSelect
              driverName={driverName as any}
              tile={replaceTile}
              onChange={setReplaceTile}
            />
          </Field>
        </div>
      </div>
      {(tileVariants.has(replaceTile) ||
        Array.from(searchAll).some((v) => tileVariants.has(v))) && (
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
          disabled={!searchAll.size || replaceTile < 0}
        >
          {t("main:common.buttons.OK")}
        </Button>
        <Button onClick={onCancel}>{t("main:common.buttons.Cancel")}</Button>
      </div>
    </div>
  );
};
