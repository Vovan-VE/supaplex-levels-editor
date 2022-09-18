import { useMemo } from "react";
import { IconContainer } from "ui/icon";
import { Checkbox, IntegerInput, useInputDebounce } from "ui/input";
import { LevelConfiguratorProps } from "../types";
import { ISupaplexLevel } from "./types";
import { Tile } from "./Tile";
import { TILE_ELECTRON, TILE_INFOTRON } from "./tiles";
import cl from "./LevelConfigurator.module.scss";

export const LevelConfigurator = <L extends ISupaplexLevel>({
  level,
  onChange,
}: LevelConfiguratorProps<L>) => {
  const [countInf, countElec] = useMemo(
    () =>
      level.body.raw.reduce<[inf: number, elec: number]>(
        ([inf, elec], v) => {
          switch (v) {
            case TILE_INFOTRON:
              return [inf + 1, elec];
            case TILE_ELECTRON:
              return [inf, elec + 1];
            default:
              return [inf, elec];
          }
        },
        [0, 0],
      ),
    [level.body],
  );

  const handlers = useMemo(
    () => ({
      gravity: (checked: boolean) => onChange(level.setInitialGravity(checked)),
      fz: (checked: boolean) => onChange(level.setInitialFreezeZonks(checked)),
      inf: (value: number | null) => {
        if (value !== null && value >= 0 && value <= 255) {
          onChange(level.setInfotronsNeed(value));
        }
      },
    }),
    [level, onChange],
  );

  return (
    <>
      <Checkbox checked={level.initialGravity} onChange={handlers.gravity}>
        Gravity
      </Checkbox>

      <Checkbox checked={level.initialFreezeZonks} onChange={handlers.fz}>
        Freeze Zonks
      </Checkbox>

      <label className={cl.field}>
        <IconContainer className={cl.icon}>
          <Tile tile={TILE_INFOTRON} />
        </IconContainer>
        <IntegerInput
          {...useInputDebounce<number | null>({
            value: level.infotronsNeed,
            onChangeEnd: handlers.inf,
          })}
          className={cl.inf}
        />
        <span>
          {level.infotronsNeed === 0 && countInf > 0 ? "= all" : "of"}{" "}
          {countInf}
          {", "}
          <IconContainer className={cl.icon}>
            <Tile tile={TILE_ELECTRON} />
          </IconContainer>
          {" x "}
          {countElec}
        </span>
      </label>
    </>
  );
};
