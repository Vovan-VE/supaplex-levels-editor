import {
  ISupaplexSpecPortDatabase,
  ISupaplexSpecPortRecordReadonly,
} from "../internal";

export const dumpSpecport = (p: ISupaplexSpecPortRecordReadonly | null) =>
  p && {
    x: p.x,
    y: p.y,
    gravity: p.gravity,
    freezeZonks: p.freezeZonks,
    freezeEnemies: p.freezeEnemies,
    unusedByte: p.unusedByte,
  };

export const dumpSpecports = (db: ISupaplexSpecPortDatabase) =>
  Array.from(db.getAll(), dumpSpecport);

export const dumpSpecportsArray = (
  ports: readonly ISupaplexSpecPortRecordReadonly[],
) => ports.map(dumpSpecport);
