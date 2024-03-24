export const enum PenShape {
  DOT,
  _1x2,
  _2x1,
  _3x3,
  // TODO: 2x1 & 1x2 with driver specific hacks (sp double chips)
}

export interface DrawStructure {
  setTiles?: readonly (number | undefined)[];
}
export type PenShapeStructures = Partial<Record<PenShape, DrawStructure>>;
