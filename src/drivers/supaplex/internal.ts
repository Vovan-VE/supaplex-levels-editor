import { IBounds, RectA } from "utils/rect";
import { IsPlayableResult, ITilesRegion, ITilesStreamItem } from "../types";

export interface ISupaplexBox extends IBounds {
  readonly length: number;
  coordsToOffset(x: number, y: number): number;
  validateCoords?(x: number, y: number): void;
}

export interface ILevelBody extends IBounds {
  readonly length: number;
  readonly raw: Uint8Array;
  getTile(x: number, y: number): number;
  setTile(x: number, y: number, value: number): ILevelBody;
  batch(update: (b: ILevelBody) => ILevelBody): ILevelBody;
  isPlayable(): IsPlayableResult;
  tilesRenderStream(
    x: number,
    y: number,
    w: number,
    h: number,
  ): Iterable<ITilesStreamItem>;
  copyRegion(
    x: number,
    y: number,
    w: number,
    h: number,
  ): readonly [x: number, y: number, region: ITilesRegion];
}

export interface ISupaplexSpecPortProps {
  setsGravity: boolean;
  setsFreezeZonks: boolean;
  setsFreezeEnemies: boolean;
}

export interface ISupaplexSpecPort extends ISupaplexSpecPortProps {
  x: number;
  y: number;
}

export interface ILevelFooter {
  readonly length: number;
  getRaw(): Uint8Array;
  readonly title: string;
  setTitle(title: string): this;
  readonly initialGravity: boolean;
  setInitialGravity(on: boolean): this;
  readonly initialFreezeZonks: boolean;
  setInitialFreezeZonks(on: boolean): this;
  readonly infotronsNeed: number;
  setInfotronsNeed(value: number): this;
  readonly specPortsCount: number;
  getSpecPorts(): Iterable<ISupaplexSpecPort>;
  copySpecPortsInRegion(r: RectA): readonly ISupaplexSpecPort[];
  clearSpecPorts(): this;
  findSpecPort(x: number, y: number): ISupaplexSpecPortProps | undefined;
  setSpecPort(x: number, y: number, props?: ISupaplexSpecPortProps): this;
  deleteSpecPort(x: number, y: number): this;
}
