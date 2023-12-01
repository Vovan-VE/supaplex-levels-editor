import { useMemo } from "react";
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
import { showSpecPortsDbDialog } from "./SpecPortsDbDialog";
import { ISupaplexLevel } from "./types";
import { TILE_ELECTRON, TILE_INFOTRON } from "./tiles-id";
import cl from "./LevelConfigurator.module.scss";

const iconChecked = <svgs.CheckboxChecked />;
const iconUnchecked = <svgs.CheckboxUnchecked />;

export const LevelConfigurator = <L extends ISupaplexLevel>({
  level,
  onChange,
  compact = false,
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
      gravity: () => onChange(level.setInitialGravity(!level.initialGravity)),
      fz: () =>
        onChange(level.setInitialFreezeZonks(!level.initialFreezeZonks)),
      fe: () =>
        onChange(level.setInitialFreezeEnemies(!level.initialFreezeEnemies)),
      inf: (value: number | null) => {
        if (value !== null) {
          if (value >= 0 && value <= 255) {
            onChange(level.setInfotronsNeed(value));
          } else {
            showToastError("From 0 to 255");
          }
        }
      },
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
      {compact ? (
        <>
          <ToolbarSeparator />
          <ButtonDropdown
            trigger={
              [
                level.initialGravity ? "Gr" : "",
                level.initialFreezeZonks ? "FZ" : "",
                level.initialFreezeEnemies ? "FE" : "",
              ]
                .filter(Boolean)
                .join(", ") || <em>default</em>
            }
            buttonClassName={cl.btnEnv}
            buttonProps={{ title: "Initial conditions" }}
          >
            <Toolbar isMenu>
              <TextButton
                uiColor={ColorType.DEFAULT}
                icon={level.initialGravity ? iconChecked : iconUnchecked}
                onClick={handlers.gravity}
              >
                Gravity
              </TextButton>
              <TextButton
                uiColor={ColorType.DEFAULT}
                icon={level.initialFreezeZonks ? iconChecked : iconUnchecked}
                onClick={handlers.fz}
              >
                Freeze Zonks
              </TextButton>
              <TextButton
                uiColor={ColorType.DEFAULT}
                icon={level.initialFreezeEnemies ? iconChecked : iconUnchecked}
                onClick={handlers.fe}
              >
                Freeze Enemies
              </TextButton>
              <ToolbarSeparator />
              <TextButton
                uiColor={ColorType.DEFAULT}
                onClick={handlers.portsDb}
              >
                SpecPorts DB...
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
            >
              Gravity
            </Checkbox>
            <Checkbox checked={level.initialFreezeZonks} onChange={handlers.fz}>
              Freeze Zonks
            </Checkbox>
            <Checkbox
              checked={level.initialFreezeEnemies}
              onChange={handlers.fe}
            >
              Freeze Enemies
            </Checkbox>
          </span>
          <Button onClick={handlers.portsDb}>SpecPorts DB...</Button>
        </>
      )}
    </>
  );
};
