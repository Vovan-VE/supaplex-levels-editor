import { FC, useCallback, useMemo, useState } from "react";
import { TileCoords } from "components/settings/display";
import { Button } from "ui/button";
import { Dialog } from "ui/feedback";
import { IconContainer, svgs } from "ui/icon";
import {
  Field,
  IntegerInput,
  RadioGroup,
  RadioOptions,
  Select,
  SelectOption,
  useInputDebounce,
} from "ui/input";
import { ColorType } from "ui/types";
import { InteractionDialogProps } from "../types";
import { InlineTile } from "./InlineTile";
import {
  FreezeEnemiesStatic,
  FreezeZonksStatic,
  GravityStatic,
  SpecPortAlterMod,
  SpecPortFreezeEnemies,
  SpecPortFreezeZonks,
  SpecPortGravity,
} from "./internal";
import {
  canHaveSpecPortsDB,
  requiresSpecPortsDB,
  setPortIsSpecial,
  TILE_ELECTRON,
  TILE_MURPHY,
  TILE_SNIK_SNAK,
  TILE_ZONK,
  toRenderPortVariant,
} from "./tiles-id";
import { ISupaplexLevel } from "./types";
import { newSpecPortRecord } from "./specPortsRecord";
import cl from "./SpecPortDialog.module.scss";
import { minmax } from "../../utils/number";

type Opt = SelectOption<number>;

const optCommon: Opt[] = [
  { value: SpecPortAlterMod.NOTHING, label: "don't change" },
  { value: SpecPortAlterMod.TOGGLE, label: "Toggle" },
];
const optGravity: Opt[] = [
  { value: GravityStatic.OFF, label: "OFF" },
  { value: GravityStatic.ON, label: "ON" },
];
const optFreezeZonks: Opt[] = [
  { value: FreezeZonksStatic.OFF, label: "Unfreeze" },
  { value: FreezeZonksStatic.ON, label: "Freeze" },
];
const optFreezeEnemies: Opt[] = [
  { value: FreezeEnemiesStatic.OFF, label: "Unfreeze" },
  { value: FreezeEnemiesStatic.ON, label: "Freeze" },
];

const ActionSelect: FC<{
  options: readonly Opt[];
  value: number;
  onChange: (n: number) => void;
}> = ({ options, value, onChange }) => {
  const allOptions = useMemo(() => [...options, ...optCommon], [options]);
  const handleSelect = useCallback(
    (o: Opt | null) => o && onChange(o.value),
    [onChange],
  );
  const handleInput = useCallback(
    (n: number | null) => {
      if (n !== null) {
        onChange(n < -2 ? SpecPortAlterMod.NOTHING : n <= 255 ? n : 255);
      }
    },
    [onChange],
  );

  return (
    <>
      <Select
        options={allOptions}
        value={allOptions.find((o) => o.value === value) ?? null}
        onChange={handleSelect}
        placeholder="Raw"
        className={cl.select}
      />
      <IntegerInput
        {...useInputDebounce<number | null>({
          value: value,
          onChangeEnd: handleInput,
        })}
        className={cl.input}
      />
    </>
  );
};

// ----------------------------

interface Props<T extends ISupaplexLevel> extends InteractionDialogProps<T> {}

export const SpecPortDialog = <T extends ISupaplexLevel>({
  cell,
  level,
  submit,
  cancel,
}: Props<T>) => {
  const { x, y } = cell;
  const tile = level.getTile(x, y);
  const wasSpecial = requiresSpecPortsDB(tile);
  const hadProps = useMemo(() => level.specports.find(x, y), [x, y, level]);

  const [isSpecial, setIsSpecial] = useState(
    wasSpecial || (Boolean(hadProps) && canHaveSpecPortsDB(tile)),
  );
  const [port, setPort] = useState(hadProps);

  const [nextLevel, nextLevelError] = useMemo(() => {
    try {
      const tile = level.getTile(x, y);
      let next = level.setTile(x, y, setPortIsSpecial(tile, isSpecial));
      if (isSpecial) {
        next = next.updateSpecports((db) =>
          db.set(port ?? newSpecPortRecord(x, y)),
        );
      }
      return [next === level ? null : next, null] as const;
    } catch (e) {
      if (e instanceof Error) {
        return [null, e] as const;
      }
      throw e;
    }
  }, [level, port, isSpecial, x, y]);

  const handleOK = useCallback(() => {
    if (nextLevel) {
      submit(nextLevel);
    } else {
      cancel();
    }
  }, [submit, cancel, nextLevel]);

  const options = useMemo<RadioOptions<boolean>>(
    () => [
      {
        value: false,
        label: (
          <>
            <InlineTile {...toRenderPortVariant(tile, false)} /> Regular Port
          </>
        ),
      },
      {
        value: true,
        label: (
          <>
            <InlineTile {...toRenderPortVariant(tile, true)} /> Special Port
          </>
        ),
      },
    ],
    [tile],
  );

  const handleGravity = useCallback(
    (g: SpecPortGravity) =>
      setPort((port) => (port ?? newSpecPortRecord(x, y)).setGravity(g)),
    [x, y],
  );
  const handleZonks = useCallback(
    (z: SpecPortFreezeZonks) =>
      setPort((port) => (port ?? newSpecPortRecord(x, y)).setFreezeZonks(z)),
    [x, y],
  );
  const handleEnemies = useCallback(
    (e: SpecPortFreezeEnemies) =>
      setPort((port) => (port ?? newSpecPortRecord(x, y)).setFreezeEnemies(e)),
    [x, y],
  );
  const {
    gravity = GravityStatic.OFF,
    freezeZonks = FreezeZonksStatic.OFF,
    freezeEnemies = FreezeEnemiesStatic.OFF,
    unusedByte = 0,
  } = port ?? {};

  const propsUnusedByteInput = useInputDebounce<number | null>({
    value: unusedByte,
    onChangeEnd: useCallback(
      (n: number | null) =>
        n === null ||
        setPort((port) =>
          (port ?? newSpecPortRecord(x, y)).setUnusedByte(minmax(n, 0, 255)),
        ),
      [x, y],
    ),
  });

  return (
    <Dialog
      open
      title="Port properties"
      size="small"
      buttons={
        <>
          <Button
            uiColor={ColorType.SUCCESS}
            onClick={handleOK}
            disabled={Boolean(nextLevelError)}
          >
            OK
          </Button>
          <Button uiColor={ColorType.MUTE} onClick={cancel}>
            Cancel
          </Button>
        </>
      }
      onClose={cancel}
    >
      <p>
        <TileCoords x={x} y={y} /> <InlineTile tile={tile} />
      </p>

      <RadioGroup options={options} value={isSpecial} onChange={setIsSpecial} />

      {isSpecial && (
        <>
          {wasSpecial && !hadProps && (
            <p>
              <i>
                <strong>NOTICE:</strong> This Special Port has no properties in
                level, and so it behaves as Regular Port. It will be fixed when
                you complete by [OK].
              </i>
            </p>
          )}
          <p>
            When Murphy pass thru this Special Port, the game conditions will
            change as following:
          </p>
          <div className={cl.actions}>
            <div className={cl.label}>
              <InlineTile tile={TILE_MURPHY} /> Gravity:
            </div>
            <ActionSelect
              options={optGravity}
              value={gravity}
              onChange={handleGravity}
            />

            <div className={cl.label}>
              <InlineTile tile={TILE_ZONK} /> Zonks:
            </div>
            <ActionSelect
              options={optFreezeZonks}
              value={freezeZonks}
              onChange={handleZonks}
            />

            <div className={cl.label}>
              <InlineTile tile={TILE_SNIK_SNAK} />
              <InlineTile tile={TILE_ELECTRON} /> Enemies:
            </div>
            <ActionSelect
              options={optFreezeEnemies}
              value={freezeEnemies}
              onChange={handleEnemies}
            />
          </div>

          <Field label="Unused byte:" className={cl.unusedByte}>
            <IntegerInput {...propsUnusedByteInput} className={cl.input} />
          </Field>
        </>
      )}

      {/*{!canSetSpecPort && (!wasSpecial || isSpecial) && (*/}
      {/*  <>*/}
      {/*    Max count {SPEC_PORT_MAX_COUNT} of Special Ports Properties is already*/}
      {/*    reached, so cannot <i>add</i> more.*/}
      {/*  </>*/}
      {/*)}*/}
      {nextLevelError ? (
        <div className={cl.error}>
          <IconContainer>
            <svgs.Cross />
          </IconContainer>{" "}
          {nextLevelError.message}
        </div>
      ) : /*nextLevel && !nextLevel.specports.isStdCompatible(level.width) ? (
        <div className={cl.warn}>
          <IconContainer>
            <svgs.Warning />
          </IconContainer>{" "}
          Level will be non-standard
        </div>
      ) :*/ null}
    </Dialog>
  );
};
