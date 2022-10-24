import { FC } from "react";
import { useStore } from "effector-react";
import { $coordsDisplayBasis, setCoordsDisplayBasis } from "models/settings";
import { Field, RadioGroup, RadioOptions } from "ui/input";
import { TileCoords } from "./display";

const OPTIONS: RadioOptions<0 | 1> = [
  {
    value: 0,
    label: (
      <>
        0-based: <TileCoords x={0} y={0} base={0} /> ...{" "}
        <TileCoords x={59} y={23} base={0} />
      </>
    ),
  },
  {
    value: 1,
    label: (
      <>
        1-based: <TileCoords x={0} y={0} base={1} /> ...{" "}
        <TileCoords x={59} y={23} base={1} />
      </>
    ),
  },
];

export const CoordsChoice: FC = () => (
  <Field labelElement="div" label="Coordinates display">
    <RadioGroup
      options={OPTIONS}
      value={useStore($coordsDisplayBasis)}
      onChange={setCoordsDisplayBasis}
    />
  </Field>
);
