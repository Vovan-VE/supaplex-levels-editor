import equal from "fast-deep-equal";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import { TileCoords } from "components/settings/display";
import { Trans } from "i18n/Trans";
import { DiffValue } from "ui/feedback";
import { DiffItem } from "../types";
import {
  ISupaplexSpecPortRecord,
  ISupaplexSpecPortRecordReadonly,
} from "./internal";
import { ISupaplexLevel } from "./types";

export const cmpLevels = (a: ISupaplexLevel, b: ISupaplexLevel) => {
  const diff: DiffItem[] = [];

  if (a.initialGravity !== b.initialGravity) {
    diff.push({
      label: <Trans i18nKey="main:supaplex.features.Gravity" />,
      a: a.initialGravity,
      b: b.initialGravity,
    });
  }
  if (a.initialFreezeZonks !== b.initialFreezeZonks) {
    diff.push({
      label: <Trans i18nKey="main:supaplex.features.FreezeZonks" />,
      a: a.initialFreezeZonks,
      b: b.initialFreezeZonks,
    });
  }
  if (a.initialFreezeEnemies !== b.initialFreezeEnemies) {
    diff.push({
      label: <Trans i18nKey="main:supaplex.features.FreezeEnemies" />,
      a: a.initialFreezeEnemies,
      b: b.initialFreezeEnemies,
    });
  }
  if (a.infotronsNeed !== b.infotronsNeed) {
    diff.push({
      label: <Trans i18nKey="main:supaplex.features.InfotronsNeed" />,
      a: a.infotronsNeed,
      b: b.infotronsNeed,
    });
  }
  if (a.useInfotronsNeeded !== b.useInfotronsNeeded) {
    diff.push({
      label: <Trans i18nKey="main:supaplex.features.UseInfotronsNeed" />,
      a: a.useInfotronsNeeded,
      b: b.useInfotronsNeeded,
    });
  }
  if (a.specports.count !== b.specports.count) {
    diff.push({
      label: <Trans i18nKey="main:supaplex.features.SpecialPorts" />,
      a: a.specports.count,
      b: b.specports.count,
    });
  }
  {
    const aPorts = specPortsArray(a);
    const bPorts = specPortsArray(b);
    for (let i = 0, L = Math.max(aPorts.length, bPorts.length); i < L; i++) {
      const ap: ISupaplexSpecPortRecord | undefined = aPorts[i];
      const bp: ISupaplexSpecPortRecord | undefined = bPorts[i];
      if (!equal(ap, bp)) {
        const which: SpecPortWhichProps = {
          x: ap?.x !== bp?.x,
          y: ap?.y !== bp?.y,
          gravity: ap?.gravity !== bp?.gravity,
          freezeZonks: ap?.freezeZonks !== bp?.freezeZonks,
          freezeEnemies: ap?.freezeEnemies !== bp?.freezeEnemies,
          unusedByte: ap?.unusedByte !== bp?.unusedByte,
        };
        diff.push({
          label: (
            <Trans
              i18nKey="main:supaplex.features.SpecPortInList"
              values={{ n: i + 1 }}
            />
          ),
          a: ap && <DiffSpecPort port={ap} side={0} which={which} />,
          b: bp && <DiffSpecPort port={bp} side={1} which={which} />,
        });
      }
    }
  }
  if (a.usePlasma !== b.usePlasma) {
    diff.push({
      label: (
        <Trans
          i18nKey="main:supaplex.features.UsePlasma"
          defaults="Use Plasma"
        />
      ),
      a: a.usePlasma,
      b: b.usePlasma,
    });
  }
  if (a.usePlasma || b.usePlasma) {
    if (a.usePlasmaTime !== b.usePlasmaTime) {
      diff.push({
        label: <Trans i18nKey="main:supaplex.features.UsePlasmaTime" />,
        a: a.usePlasmaTime,
        b: b.usePlasmaTime,
      });
    }
    if (a.usePlasmaLimit !== b.usePlasmaLimit) {
      diff.push({
        label: <Trans i18nKey="main:supaplex.features.UsePlasmaLimit" />,
        a: a.usePlasmaLimit,
        b: b.usePlasmaLimit,
      });
    }
  }
  if (a.useZonker !== b.useZonker) {
    diff.push({
      label: <Trans i18nKey="main:supaplex.features.UseZonker" />,
      a: a.useZonker,
      b: b.useZonker,
    });
  }
  if (a.useSerialPorts !== b.useSerialPorts) {
    diff.push({
      label: <Trans i18nKey="main:supaplex.features.UseSerialPorts" />,
      a: a.useSerialPorts,
      b: b.useSerialPorts,
    });
  }

  return diff;
};

const cmpSpecPorts = (a: ISupaplexSpecPortRecord, b: ISupaplexSpecPortRecord) =>
  a.y - b.y || a.x - b.x;

const specPortsArray = (level: ISupaplexLevel) =>
  Array.from(level.specports.getAll()).sort(cmpSpecPorts);

type SpecPortWhichProps = Record<
  keyof ISupaplexSpecPortRecordReadonly,
  boolean
>;
const DiffSpecPort: FC<{
  port: ISupaplexSpecPortRecordReadonly;
  side: 0 | 1;
  which: SpecPortWhichProps;
}> = ({
  port: { x, y, gravity, freezeZonks, freezeEnemies, unusedByte },
  side,
  which,
}) => {
  const { t } = useTranslation();
  return (
    <div>
      <span>
        {which.x && which.y ? (
          <DiffValue side={side} different>
            <TileCoords x={x} y={y} />
          </DiffValue>
        ) : (
          <TileCoords
            x={x}
            y={y}
            format={(x, y, b) => (
              <>
                [
                <DiffValue side={side} different={which.x}>
                  {x}
                </DiffValue>
                {"; "}
                <DiffValue side={side} different={which.y}>
                  {y}
                </DiffValue>
                ]{b}
              </>
            )}
          />
        )}
      </span>
      <br />
      <span>
        {t("main:supaplex.features.Gravity")}
        {": "}
        <DiffValue side={side} different={which.gravity}>
          <b>{String(gravity)}</b>
        </DiffValue>
      </span>
      <br />
      <span>
        {t("main:supaplex.features.FreezeZonks")}
        {": "}
        <DiffValue side={side} different={which.freezeZonks}>
          <b>{String(freezeZonks)}</b>
        </DiffValue>
      </span>
      <br />
      <span>
        {t("main:supaplex.features.FreezeEnemies")}
        {": "}
        <DiffValue side={side} different={which.freezeEnemies}>
          <b>{String(freezeEnemies)}</b>
        </DiffValue>
      </span>
      <br />
      <span>
        {t("main:supaplex.features.UnusedByte")}
        {": "}
        <DiffValue side={side} different={which.unusedByte}>
          <b>{unusedByte}</b>
        </DiffValue>
      </span>
    </div>
  );
};
