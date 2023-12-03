import { createEvent, restore } from "effector";
import { useStore } from "effector-react";
import { FC, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { TileSelect } from "components/driver/TileSelect";
import { FlipDirection, getDriver } from "drivers";
import { Trans } from "i18n/Trans";
import { $currentDriverName } from "models/levelsets";
import { HK_EDIT_GRADIENT } from "models/ui/hotkeys-defined";
import { Button } from "ui/button";
import { svgs } from "ui/icon";
import { Field, RadioGroup, RadioOptions } from "ui/input";
import { ColorType } from "ui/types";
import { elKeepOld } from "./_common";
import { SelectionEditor, SelectionEditorProps } from "./_types";
import clC from "./common.module.scss";

const directionOptions: RadioOptions<FlipDirection> = [
  {
    value: FlipDirection.H,
    label: <Trans i18nKey="main:selectionEditors.gradient.Horizontal" />,
  },
  {
    value: FlipDirection.V,
    label: <Trans i18nKey="main:selectionEditors.gradient.Vertical" />,
  },
];

const getChoice = (
  d: FlipDirection,
  width: number,
  height: number,
): ((x: number, y: number) => 0 | 1) =>
  d === FlipDirection.H
    ? //  --------------------------------
      // 0                                width
      // 0%     n%                        100%
      //  ======------======------...
      //  cell 0      cell 2
      //        cell 1
      //
      // so, % for cell[i] should calc from the middle of cell, that is from `i+0.5`
      (x) => (Math.random() > (x + 0.5) / width ? 0 : 1)
    : (_, y) => (Math.random() > (y + 0.5) / height ? 0 : 1);

const setFromTile = createEvent<number>();
const setToTile = createEvent<number>();
const setDirection = createEvent<FlipDirection>();
const $fromTile = restore(setFromTile, -1);
const $toTile = restore(setToTile, -1);
const $direction = restore(setDirection, FlipDirection.H);

const GradientEditor: FC<SelectionEditorProps> = ({
  region,
  onSubmit,
  onCancel,
}) => {
  const { t } = useTranslation();
  const driverName = useStore($currentDriverName)!;
  const { tempLevelFromRegion } = getDriver(driverName)!;
  const tempLevel = useMemo(
    () => tempLevelFromRegion(region),
    [region, tempLevelFromRegion],
  );

  const fromTile = useStore($fromTile);
  const toTile = useStore($toTile);
  const direction = useStore($direction);

  const handleSubmit = useCallback(() => {
    const { width, height } = tempLevel;
    onSubmit(
      tempLevel
        .batch((level) => {
          const { width, height } = level;
          const choice = getChoice(direction, width, height);
          for (let j = height; j-- > 0; ) {
            for (let i = width; i-- > 0; ) {
              const next = choice(i, j) === 0 ? fromTile : toTile;
              if (next >= 0) {
                level = level.setTile(i, j, next);
              }
            }
          }
          return level;
        })
        .copyRegion({ x: 0, y: 0, width, height }),
    );
  }, [fromTile, toTile, direction, tempLevel, onSubmit]);

  return (
    <div>
      <div className={clC.row2}>
        <Field label={t("main:selectionEditors.gradient.FromTile")}>
          <TileSelect
            driverName={driverName as any}
            tile={fromTile}
            onChange={setFromTile}
            canClear
            placeholder={elKeepOld}
          />
        </Field>
        <Field label={t("main:selectionEditors.gradient.ToTile")}>
          <TileSelect
            driverName={driverName as any}
            tile={toTile}
            onChange={setToTile}
            canClear
            placeholder={elKeepOld}
          />
        </Field>
      </div>
      <RadioGroup
        options={directionOptions}
        value={direction}
        onChange={setDirection}
      />

      <div className={clC.buttons}>
        <Button
          uiColor={ColorType.SUCCESS}
          onClick={handleSubmit}
          disabled={fromTile < 0 && toTile < 0}
        >
          {t("main:common.buttons.OK")}
        </Button>
        <Button onClick={onCancel}>{t("main:common.buttons.Cancel")}</Button>
      </div>
    </div>
  );
};

export const gradient: SelectionEditor = {
  title: <Trans i18nKey="main:selectionEditors.gradient.Title" />,
  icon: <svgs.Gradient />,
  Component: GradientEditor,
  hotkeys: HK_EDIT_GRADIENT,
};
