import equal from "fast-deep-equal";
import { FC } from "react";
import { TileCoords } from "components/settings/display";
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
      label: "Gravity",
      a: a.initialGravity,
      b: b.initialGravity,
    });
  }
  if (a.initialFreezeZonks !== b.initialFreezeZonks) {
    diff.push({
      label: "Freeze Zonks",
      a: a.initialFreezeZonks,
      b: b.initialFreezeZonks,
    });
  }
  if (a.infotronsNeed !== b.infotronsNeed) {
    diff.push({
      label: "Infotrons Need",
      a: a.infotronsNeed,
      b: b.infotronsNeed,
    });
  }
  if (a.useInfotronsNeeded !== b.useInfotronsNeeded) {
    diff.push({
      label: "Custom Infotrons Needed",
      a: a.useInfotronsNeeded,
      b: b.useInfotronsNeeded,
    });
  }
  if (a.specports.count !== b.specports.count) {
    diff.push({
      label: "Special Ports",
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
          label: `Spec port #${i + 1}`,
          a: ap && <DiffSpecPort port={ap} side={0} which={which} />,
          b: bp && <DiffSpecPort port={bp} side={1} which={which} />,
        });
      }
    }
  }
  if (a.usePlasma !== b.usePlasma) {
    diff.push({
      label: "Use Plasma",
      a: a.usePlasma,
      b: b.usePlasma,
    });
  }
  if (a.usePlasma || b.usePlasma) {
    if (a.usePlasmaTime !== b.usePlasmaTime) {
      diff.push({
        label: "Plasma Time",
        a: a.usePlasmaTime,
        b: b.usePlasmaTime,
      });
    }
    if (a.usePlasmaLimit !== b.usePlasmaLimit) {
      diff.push({
        label: "Plasma Limit",
        a: a.usePlasmaLimit,
        b: b.usePlasmaLimit,
      });
    }
  }
  if (a.useZonker !== b.useZonker) {
    diff.push({
      label: "Use Zonker",
      a: a.useZonker,
      b: b.useZonker,
    });
  }
  if (a.useSerialPorts !== b.useSerialPorts) {
    diff.push({
      label: "Use Serial Ports",
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
}) => (
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
      Gravity:{" "}
      <DiffValue side={side} different={which.gravity}>
        <b>{String(gravity)}</b>
      </DiffValue>
    </span>
    <br />
    <span>
      Freeze Zonks:{" "}
      <DiffValue side={side} different={which.freezeZonks}>
        <b>{String(freezeZonks)}</b>
      </DiffValue>
    </span>
    <br />
    <span>
      Freeze Enemies:{" "}
      <DiffValue side={side} different={which.freezeEnemies}>
        <b>{String(freezeEnemies)}</b>
      </DiffValue>
    </span>
    <br />
    <span>
      Unused Byte:{" "}
      <DiffValue side={side} different={which.unusedByte}>
        <b>{unusedByte}</b>
      </DiffValue>
    </span>
  </div>
);
