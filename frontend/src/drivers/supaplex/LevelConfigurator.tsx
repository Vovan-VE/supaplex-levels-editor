import { useMemo } from "react";
import { showToastError } from "models/ui/toasts";
import { Checkbox, IntegerInput, useInputDebounce } from "ui/input";
import { LevelConfiguratorProps } from "../types";
import { InlineTile } from "./InlineTile";
import { ISupaplexLevel } from "./types";
import { TILE_ELECTRON, TILE_INFOTRON } from "./tiles-id";
import cl from "./LevelConfigurator.module.scss";

export const LevelConfigurator = <L extends ISupaplexLevel>({
  level,
  onChange,
}: LevelConfiguratorProps<L>) => {
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
      gravity: (checked: boolean) => onChange(level.setInitialGravity(checked)),
      fz: (checked: boolean) => onChange(level.setInitialFreezeZonks(checked)),
      inf: (value: number | null) => {
        if (value !== null) {
          if (value >= 0 && value <= 255) {
            onChange(level.setInfotronsNeed(value));
          } else {
            showToastError("From 0 to 255");
          }
        }
      },
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
        />
        <span>
          {level.infotronsNeed === 0 && countInf > 0 ? (
            countInf < 256 ? (
              `= all ${countInf}`
            ) : (
              <span
                title={
                  `Actual number of Infotrons is ${countInf},\n` +
                  `but SP counts it in a single byte,\n` +
                  `so the result is a module of 256:\n` +
                  `${countInf} & 0xFF = ${countInf} % 256 = ${countInf % 256}`
                }
                className={cl.infModNotice}
              >
                = {countInf % 256}
              </span>
            )
          ) : (
            `of ${countInf}`
          )}
          {", "}
          <InlineTile tile={TILE_ELECTRON} />
          {" x "}
          {countElec}
        </span>
      </label>
      <wbr />
      <span>
        <Checkbox checked={level.initialGravity} onChange={handlers.gravity}>
          Gravity
        </Checkbox>
        <Checkbox checked={level.initialFreezeZonks} onChange={handlers.fz}>
          Freeze Zonks
        </Checkbox>
      </span>
    </>
  );
};
