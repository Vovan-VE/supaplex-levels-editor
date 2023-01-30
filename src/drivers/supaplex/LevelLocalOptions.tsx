import { useCallback } from "react";
import { Checkbox } from "ui/input";
import { LevelConfiguratorProps } from "../types";
import { InlineTile } from "./InlineTile";
import { TILE_HW_LAMP_R, TILE_HW_STRIPES } from "./tiles-id";
import { ISupaplexLevel } from "./types";

export const LevelLocalOptions = <L extends ISupaplexLevel>({
  level,
  onChange,
}: LevelConfiguratorProps<L>) => {
  const { usePlasma, useZonker } = level;

  const handlePlasmaChange = useCallback(
    (checked: boolean) => onChange(level.setUsePlasma(checked)),
    [level, onChange],
  );
  const handleZonkerChange = useCallback(
    (checked: boolean) => onChange(level.setUseZonker(checked)),
    [level, onChange],
  );

  return (
    <>
      <div>
        <Checkbox checked={usePlasma} onChange={handlePlasmaChange}>
          Replace <InlineTile tile={TILE_HW_STRIPES} /> with Plasma
        </Checkbox>
      </div>
      <div>
        <Checkbox checked={useZonker} onChange={handleZonkerChange}>
          Replace <InlineTile tile={TILE_HW_LAMP_R} /> 2x2 with Zonker
        </Checkbox>
      </div>
    </>
  );
};

const P_PLASMA = "use-plasma";
const P_ZONKER = "use-zonkers";
export const applyLocalOptions = <L extends ISupaplexLevel>(
  level: L,
  url: URL,
) => {
  const p = url.searchParams;
  if (level.usePlasma) {
    p.set(P_PLASMA, "");
  }
  if (level.useZonker) {
    p.set(P_ZONKER, "");
  }
  return url;
};
