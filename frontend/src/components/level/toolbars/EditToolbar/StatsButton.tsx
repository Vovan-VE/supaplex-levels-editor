import { createEvent, restore } from "effector";
import { useUnit } from "effector-react";
import { FC, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Trans } from "i18n/Trans";
import { $drvTileRender } from "models/levels";
import { $currentLevelUndoQueue } from "models/levelsets";
import { Button } from "ui/button";
import { msgBox } from "ui/feedback";
import { svgs } from "ui/icon";
import { RadioGroup, RadioOptions } from "ui/input";
import cl from "./StatsButton.module.scss";

const enum SortBy {
  Definition,
  Count,
}
const options: RadioOptions<SortBy> = [
  {
    value: SortBy.Definition,
    label: <Trans i18nKey="main:levelStats.sort.ByValue" />,
  },
  {
    value: SortBy.Count,
    label: <Trans i18nKey="main:levelStats.sort.ByCount" />,
  },
];
const setSort = createEvent<SortBy>();
const $sort = restore(setSort, SortBy.Definition);

const Stats: FC = () => {
  // const tiles = useUnit($drvTiles)!;
  const TileRender = useUnit($drvTileRender)!;
  const level = useUnit($currentLevelUndoQueue)!.current;

  const [byDefinition, byCount] = useMemo(() => {
    const counts = new Map<number, number>();
    const { width, height } = level;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const tile = level.getTile(x, y);
        counts.set(tile, (counts.get(tile) ?? 0) + 1);
      }
    }
    return [
      [...counts].sort(([a], [b]) => a - b),
      [...counts].sort(([aT, aC], [bT, bC]) => bC - aC || aT - bT),
    ];
  }, [level]);

  const sort = useUnit($sort);
  const nf = new Intl.NumberFormat();

  return (
    <div className={cl.root}>
      <RadioGroup
        options={options}
        value={sort}
        onChange={setSort}
        flowInline
      />
      <div className={cl.tiles}>
        {(sort === SortBy.Definition ? byDefinition : byCount).map(
          ([tile, count]) => (
            <div key={tile} className={cl.cell}>
              <TileRender tile={tile} className={cl.tile} />
              <span className={cl.count}>{nf.format(count)}</span>
            </div>
          ),
        )}
      </div>
    </div>
  );
};

export const StatsButton: FC = () => {
  const { t } = useTranslation();
  return (
    <Button
      icon={<svgs.ChartBar />}
      onClick={useCallback(
        () => msgBox(<Stats />, { title: t("main:levelStats.DialogTitle") }),
        [t],
      )}
    />
  );
};
