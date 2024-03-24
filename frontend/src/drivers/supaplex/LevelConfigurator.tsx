import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { showToastError } from "models/ui/toasts";
import {
  Button,
  ButtonDropdown,
  TextButton,
  Toolbar,
  ToolbarSeparator,
} from "ui/button";
import { svgs } from "ui/icon";
import { Checkbox, IntegerInput, useInputDebounce } from "ui/input";
import { ColorType } from "ui/types";
import { LevelConfiguratorProps } from "../types";
import { InlineTile } from "./InlineTile";
import { showSpecPortsDbDialog } from "./showSpecPortsDbDialog";
import { ISupaplexLevel } from "./types";
import { TILE_ELECTRON, TILE_INFOTRON } from "./tiles-id";
import cl from "./LevelConfigurator.module.scss";

const iconChecked = <svgs.CheckboxChecked />;
const iconUnchecked = <svgs.CheckboxUnchecked />;

export const LevelConfigurator = <L extends ISupaplexLevel>({
  level,
  onChange,
  compact,
}: LevelConfiguratorProps<L>) => {
  const isRO = !onChange;
  const { t } = useTranslation();
  const { i: countInf, e: countElec } = useMemo(() => {
    let i = 0;
    let e = 0;
    for (const v of level.body.raw) {
      switch (v) {
        case TILE_INFOTRON:
          i++;
          break;
        case TILE_ELECTRON:
          e++;
          break;
      }
    }
    return { i, e };
  }, [level.body.raw]);

  const handlers = useMemo(
    () => ({
      gravity:
        onChange &&
        (() => onChange(level.setInitialGravity(!level.initialGravity))),
      fz: () =>
        onChange &&
        onChange(level.setInitialFreezeZonks(!level.initialFreezeZonks)),
      fe: () =>
        onChange &&
        onChange(level.setInitialFreezeEnemies(!level.initialFreezeEnemies)),
      inf:
        onChange &&
        ((value: number | null) => {
          if (value !== null) {
            if (value >= 0 && value <= 255) {
              onChange(level.setInfotronsNeed(value));
            } else {
              // TODO: validation i18n
              showToastError("From 0 to 255");
            }
          }
        }),
      portsDb: () => showSpecPortsDbDialog({ level, onChange }),
    }),
    [level, onChange],
  );

  return (
    <>
      <label className={cl.field}>
        <InlineTile tile={TILE_INFOTRON} />
        <IntegerInput
          {...useInputDebounce<number | null>({
            value: level.infotronsNeed,
            onChangeEnd: handlers.inf,
          })}
          className={cl.inf}
          readOnly={isRO}
        />
        <span>
          {level.infotronsNeed === 0 && countInf > 0 ? (
            countInf < 256 ? (
              t("main:supaplex.infotronsNeed.All", { n: countInf })
            ) : (
              <span
                title={t("main:supaplex.infotronsNeed.Mod256", {
                  total: countInf,
                  mod: countInf % 256,
                })}
                className={cl.infModNotice}
              >
                {t("main:supaplex.infotronsNeed.Actual", { n: countInf % 256 })}
              </span>
            )
          ) : (
            t("main:supaplex.infotronsNeed.OfTotal", { n: countInf })
          )}
          {", "}
          <InlineTile tile={TILE_ELECTRON} />
          {" x "}
          {countElec}
        </span>
      </label>
      <wbr />
      {compact ? (
        <>
          <ToolbarSeparator />
          <ButtonDropdown
            trigger={
              [
                level.initialGravity ? t("main:supaplex.initial.Gravity") : "",
                level.initialFreezeZonks
                  ? t("main:supaplex.initial.FreezeZonks")
                  : "",
                level.initialFreezeEnemies
                  ? t("main:supaplex.initial.FreezeEnemies")
                  : "",
              ]
                .filter(Boolean)
                .join(", ") || <em>{t("main:supaplex.initial.None")}</em>
            }
            buttonClassName={cl.btnEnv}
            buttonProps={{
              title: t("main:supaplex.config.InitialEnv"),
            }}
          >
            <Toolbar isMenu>
              <TextButton
                uiColor={ColorType.DEFAULT}
                icon={level.initialGravity ? iconChecked : iconUnchecked}
                onClick={handlers.gravity}
                disabled={isRO}
              >
                {t("main:supaplex.features.Gravity")}
              </TextButton>
              <TextButton
                uiColor={ColorType.DEFAULT}
                icon={level.initialFreezeZonks ? iconChecked : iconUnchecked}
                onClick={handlers.fz}
                disabled={isRO}
              >
                {t("main:supaplex.features.FreezeZonks")}
              </TextButton>
              <TextButton
                uiColor={ColorType.DEFAULT}
                icon={level.initialFreezeEnemies ? iconChecked : iconUnchecked}
                onClick={handlers.fe}
                disabled={isRO}
              >
                {t("main:supaplex.features.FreezeEnemies")}
              </TextButton>
              <ToolbarSeparator />
              <TextButton
                uiColor={ColorType.DEFAULT}
                onClick={handlers.portsDb}
              >
                {t("main:supaplex.config.SpecPortsDB")}
              </TextButton>
            </Toolbar>
          </ButtonDropdown>
        </>
      ) : (
        <>
          <span>
            <Checkbox
              checked={level.initialGravity}
              onChange={handlers.gravity}
              disabled={isRO}
            >
              {t("main:supaplex.features.Gravity")}
            </Checkbox>
            <Checkbox
              checked={level.initialFreezeZonks}
              onChange={handlers.fz}
              disabled={isRO}
            >
              {t("main:supaplex.features.FreezeZonks")}
            </Checkbox>
            <Checkbox
              checked={level.initialFreezeEnemies}
              onChange={handlers.fe}
              disabled={isRO}
            >
              {t("main:supaplex.features.FreezeEnemies")}
            </Checkbox>
          </span>
          <Button onClick={handlers.portsDb}>
            {t("main:supaplex.config.SpecPortsDB")}
          </Button>
        </>
      )}
    </>
  );
};
