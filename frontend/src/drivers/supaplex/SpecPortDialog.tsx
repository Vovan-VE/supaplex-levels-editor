import { FC, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { TileCoords } from "components/settings/display";
import { Trans } from "i18n/Trans";
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
import { minmax } from "utils/number";
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

type Opt = SelectOption<number>;

const ActionSelect: FC<{
  options: readonly Opt[];
  value: number;
  onChange?: (n: number) => void;
  disabled?: boolean;
}> = ({ options, value, onChange, disabled }) => {
  const { t } = useTranslation();

  const allOptions = useMemo<Opt[]>(
    () => [
      ...options,
      {
        value: SpecPortAlterMod.NOTHING,
        label: t("main:supaplex.specport.DontChange"),
      },
      {
        value: SpecPortAlterMod.TOGGLE,
        label: t("main:supaplex.specport.Toggle"),
      },
    ],
    [options, t],
  );
  const handleSelect = useMemo(
    () => onChange && ((o: Opt | null) => o && onChange(o.value)),
    [onChange],
  );
  const handleInput = useMemo(
    () =>
      onChange &&
      ((n: number | null) => {
        if (n !== null) {
          onChange(n < -2 ? SpecPortAlterMod.NOTHING : n <= 255 ? n : 255);
        }
      }),
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
        isDisabled={disabled}
      />
      <IntegerInput
        {...useInputDebounce<number | null>({
          value: value,
          onChangeEnd: handleInput,
        })}
        className={cl.input}
        readOnly={disabled}
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
  const { t } = useTranslation();
  const isRo = !submit;

  const { optGravity, optFreezeZonks, optFreezeEnemies } = useMemo(() => {
    const optGravity: Opt[] = [
      {
        value: GravityStatic.OFF,
        label: t("main:supaplex.specport.gravity.Off"),
      },
      {
        value: GravityStatic.ON,
        label: t("main:supaplex.specport.gravity.On"),
      },
    ];
    const optFreezeZonks: Opt[] = [
      {
        value: FreezeZonksStatic.OFF,
        label: t("main:supaplex.specport.freezeZonks.Off"),
      },
      {
        value: FreezeZonksStatic.ON,
        label: t("main:supaplex.specport.freezeZonks.On"),
      },
    ];
    const optFreezeEnemies: Opt[] = [
      {
        value: FreezeEnemiesStatic.OFF,
        label: t("main:supaplex.specport.freezeEnemies.Off"),
      },
      {
        value: FreezeEnemiesStatic.ON,
        label: t("main:supaplex.specport.freezeEnemies.On"),
      },
    ];

    return { optGravity, optFreezeZonks, optFreezeEnemies };
  }, [t]);

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

  const handleOK = useMemo(
    () =>
      submit &&
      (() => {
        if (nextLevel) {
          submit(nextLevel);
        } else {
          cancel();
        }
      }),
    [submit, cancel, nextLevel],
  );

  const options = useMemo<RadioOptions<boolean>>(
    () => [
      {
        value: false,
        label: (
          <>
            <InlineTile {...toRenderPortVariant(tile, false)} />{" "}
            {t("main:supaplex.specport.IsRegular")}
          </>
        ),
      },
      {
        value: true,
        label: (
          <>
            <InlineTile {...toRenderPortVariant(tile, true)} />{" "}
            {t("main:supaplex.specport.IsSpecial")}
          </>
        ),
      },
    ],
    [tile, t],
  );

  const handleGravity = useMemo(
    () =>
      isRo
        ? undefined
        : (g: SpecPortGravity) =>
            setPort((port) => (port ?? newSpecPortRecord(x, y)).setGravity(g)),
    [x, y, isRo],
  );
  const handleZonks = useMemo(
    () =>
      isRo
        ? undefined
        : (z: SpecPortFreezeZonks) =>
            setPort((port) =>
              (port ?? newSpecPortRecord(x, y)).setFreezeZonks(z),
            ),
    [x, y, isRo],
  );
  const handleEnemies = useMemo(
    () =>
      isRo
        ? undefined
        : (e: SpecPortFreezeEnemies) =>
            setPort((port) =>
              (port ?? newSpecPortRecord(x, y)).setFreezeEnemies(e),
            ),
    [x, y, isRo],
  );
  const {
    gravity = GravityStatic.OFF,
    freezeZonks = FreezeZonksStatic.OFF,
    freezeEnemies = FreezeEnemiesStatic.OFF,
    unusedByte = 0,
  } = port ?? {};

  const propsUnusedByteInput = useInputDebounce<number | null>({
    value: unusedByte,
    onChangeEnd: useMemo(
      () =>
        isRo
          ? undefined
          : (n: number | null) =>
              n === null ||
              setPort((port) =>
                (port ?? newSpecPortRecord(x, y)).setUnusedByte(
                  minmax(n, 0, 255),
                ),
              ),
      [x, y, isRo],
    ),
  });

  return (
    <Dialog
      open
      title={t("main:supaplex.specport.DialogTitle")}
      size="small"
      buttons={
        <>
          {isRo || (
            <Button
              uiColor={ColorType.SUCCESS}
              onClick={handleOK}
              disabled={Boolean(nextLevelError)}
            >
              {t("main:common.buttons.OK")}
            </Button>
          )}
          <Button uiColor={ColorType.MUTE} onClick={cancel}>
            {t("main:common.buttons.Cancel")}
          </Button>
        </>
      }
      onClose={cancel}
    >
      <p>
        <TileCoords x={x} y={y} /> <InlineTile tile={tile} />
      </p>

      <RadioGroup
        options={options}
        value={isSpecial}
        onChange={setIsSpecial}
        disabled={isRo}
      />

      {isSpecial && (
        <>
          {wasSpecial && !hadProps && (
            <p>
              <Trans i18nKey="main:supaplex.specport.NoticeSpecialWithoutProps" />
            </p>
          )}
          <p>
            <Trans i18nKey="main:supaplex.specport.PreStatement" />
          </p>
          <div className={cl.actions}>
            <div className={cl.label}>
              <InlineTile tile={TILE_MURPHY} />{" "}
              {t("main:supaplex.specport.Gravity")}:
            </div>
            <ActionSelect
              options={optGravity}
              value={gravity}
              onChange={handleGravity}
              disabled={isRo}
            />

            <div className={cl.label}>
              <InlineTile tile={TILE_ZONK} />{" "}
              {t("main:supaplex.specport.Zonks")}:
            </div>
            <ActionSelect
              options={optFreezeZonks}
              value={freezeZonks}
              onChange={handleZonks}
              disabled={isRo}
            />

            <div className={cl.label}>
              <InlineTile tile={TILE_SNIK_SNAK} />
              <InlineTile tile={TILE_ELECTRON} />{" "}
              {t("main:supaplex.specport.Enemies")}:
            </div>
            <ActionSelect
              options={optFreezeEnemies}
              value={freezeEnemies}
              onChange={handleEnemies}
              disabled={isRo}
            />
          </div>

          <Field
            label={t("main:supaplex.features.UnusedByte")}
            className={cl.unusedByte}
          >
            <IntegerInput
              {...propsUnusedByteInput}
              className={cl.input}
              readOnly={isRo}
            />
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
