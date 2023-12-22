import cn from "classnames";
import { createEvent, createStore } from "effector";
import { useUnit } from "effector-react";
import { FC, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import * as RoMap from "@cubux/readonly-map";
import { getDriver, getTilesForToolbar } from "drivers";
import { Trans } from "i18n/Trans";
import { $currentDriverName } from "models/levelsets";
import { HK_EDIT_RANDOM } from "models/ui/hotkeys-defined";
import { Button, TextButton } from "ui/button";
import { svgs } from "ui/icon";
import { Field, Range } from "ui/input";
import { ColorType } from "ui/types";
import { EMPTY_MAP } from "utils/data";
import { elKeepOld } from "./_common";
import { SelectionEditor, SelectionEditorProps } from "./_types";
import clC from "./common.module.scss";
import cl from "./rnd.module.scss";

const getRandomTile = (
  prob: ReadonlyMap<number, number>,
  total: number,
): number => {
  let n = Math.floor(Math.random() * total);
  for (const [tile, count] of prob) {
    if (n < count) {
      return tile;
    }
    n -= count;
  }
  throw new Error("unreachable");
};

const toggleTile = createEvent<number>();
const toggleTileKeep = toggleTile.prepend<any>(() => -1);
const setCount = createEvent<[tile: number, count: number]>();
const $probabilities = createStore<ReadonlyMap<number, number>>(EMPTY_MAP)
  .on(toggleTile, (map, tile) =>
    map.has(tile) ? RoMap.remove(map, tile) : RoMap.set(map, tile, 1),
  )
  .on(setCount, (map, [tile, count]) => RoMap.set(map, tile, count));
const $total = $probabilities.map((prob) =>
  RoMap.reduce(prob, (n, c) => n + c, 0),
);

const RndEditor: FC<SelectionEditorProps> = ({
  region,
  onSubmit,
  onCancel,
}) => {
  const { t } = useTranslation();
  const driverName = useUnit($currentDriverName)!;
  const { tempLevelFromRegion, tiles, TileRender } = getDriver(driverName)!;
  const tempLevel = useMemo(
    () => tempLevelFromRegion(region),
    [region, tempLevelFromRegion],
  );

  const prob = useUnit($probabilities);
  const total = useUnit($total);

  const tilesSorted = useMemo(
    () =>
      getTilesForToolbar(tiles)
        .filter(
          ([, { value, metaTile }]) =>
            !metaTile || metaTile.primaryValue === value,
        )
        .map(([, t]) => [t, () => toggleTile(t.value)] as const),
    [tiles],
  );

  const handleSubmit = useCallback(() => {
    const { width, height } = tempLevel;
    onSubmit(
      tempLevel
        .batch((level) => {
          for (let j = height; j-- > 0; ) {
            for (let i = width; i-- > 0; ) {
              const tile = getRandomTile(prob, total);
              if (tile >= 0) {
                level = level.setTile(i, j, tile);
              }
            }
          }
          return level;
        })
        .copyRegion({ x: 0, y: 0, width, height }),
    );
  }, [prob, total, tempLevel, onSubmit]);

  return (
    <div>
      <Field label={t("main:selectionEditors.rnd.WhichTiles")}>
        <Button
          uiColor={prob.has(-1) ? ColorType.WARN : ColorType.MUTE}
          asLink={!prob.has(-1)}
          onClick={toggleTileKeep}
        >
          {elKeepOld}
        </Button>
        {tilesSorted.map(([{ value, title, metaTile }, onClick]) => (
          <TextButton
            key={value}
            uiColor={ColorType.WARN}
            icon={<TileRender tile={value} className={cl.tile} />}
            title={(metaTile?.title ?? title)(t)}
            onClick={onClick}
            className={cn(cl.btn, prob.has(value) && cl._checked)}
          />
        ))}
      </Field>
      <Field
        label={t("main:selectionEditors.rnd.Probabilities")}
        labelElement="div"
      >
        {prob.size > 0 ? (
          <div className={cl.gridSmall}>
            {Array.from(prob)
              .sort(([a], [b]) => a - b)
              .map(([tile, count]) => (
                <div key={tile}>
                  {tile >= 0 ? (
                    <TileRender tile={tile} className={cn(cl.tile, cl.icon)} />
                  ) : (
                    <em>{t("main:selectionEditors.rnd.Keep")}</em>
                  )}
                  <Range
                    min={1}
                    max={30}
                    value={count}
                    onChange={(v) => setCount([tile, v])}
                    className={cl.input}
                  />
                  <div className={cl.help}>
                    {((count / total) * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <em>{t("main:selectionEditors.rnd.HintMinCount")}</em>
        )}
      </Field>

      <div className={clC.buttons}>
        <Button
          uiColor={ColorType.SUCCESS}
          onClick={handleSubmit}
          disabled={prob.size < 2}
        >
          {t("main:common.buttons.OK")}
        </Button>
        <Button onClick={onCancel}>{t("main:common.buttons.Cancel")}</Button>
      </div>
    </div>
  );
};

export const rnd: SelectionEditor = {
  title: <Trans i18nKey="main:selectionEditors.rnd.Title" />,
  icon: <svgs.Random />,
  Component: RndEditor,
  hotkeys: HK_EDIT_RANDOM,
};
