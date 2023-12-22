import { createEvent, restore } from "effector";
import { useUnit } from "effector-react";
import { FC, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { TileSelect } from "components/driver/TileSelect";
import { getDriver } from "drivers";
import { Trans } from "i18n/Trans";
import { $currentDriverName } from "models/levelsets";
import { HK_EDIT_CHESS } from "models/ui/hotkeys-defined";
import { Button } from "ui/button";
import { svgs } from "ui/icon";
import { Field } from "ui/input";
import { ColorType } from "ui/types";
import { elKeepOld } from "./_common";
import { SelectionEditor, SelectionEditorProps } from "./_types";
import clC from "./common.module.scss";

const setFirstTile = createEvent<number>();
const setSecondTile = createEvent<number>();
const $firstTile = restore(setFirstTile, -1);
const $secondTile = restore(setSecondTile, -1);

const ChessEditor: FC<SelectionEditorProps> = ({
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

  const firstTile = useUnit($firstTile);
  const secondTile = useUnit($secondTile);

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
        <Field label={t("main:selectionEditors.chess.FirstTile")}>
          <TileSelect
            driverName={driverName as any}
            tile={firstTile}
            onChange={setFirstTile}
            canClear
            placeholder={elKeepOld}
          />
        </Field>
        <Field label={t("main:selectionEditors.chess.SecondTile")}>
          <TileSelect
            driverName={driverName as any}
            tile={secondTile}
            onChange={setSecondTile}
            canClear
            placeholder={elKeepOld}
          />
        </Field>
      </div>

      <div className={clC.buttons}>
        <Button
          uiColor={ColorType.SUCCESS}
          onClick={handleSubmit}
          disabled={firstTile < 0 && secondTile < 0}
        >
          {t("main:common.buttons.OK")}
        </Button>
        <Button onClick={onCancel}>{t("main:common.buttons.Cancel")}</Button>
      </div>
    </div>
  );
};

export const chess: SelectionEditor = {
  title: <Trans i18nKey="main:selectionEditors.chess.Title" />,
  icon: <svgs.Chess />,
  cannotWorkWhy: (s) =>
    s.width < 2 && s.height < 2 ? (
      <Trans i18nKey="main:selectionEditors.chess.MinSizeRequire" />
    ) : null,
  Component: ChessEditor,
  hotkeys: HK_EDIT_CHESS,
};
