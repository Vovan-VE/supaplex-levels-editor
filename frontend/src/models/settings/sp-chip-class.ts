import { useUnit } from "effector-react";
import { SpChipClassic, SpChipWinplex } from "drivers/supaplex/tile-classes";
import { $spChip } from "./index";

const CL_SP_CHIP = [SpChipClassic, SpChipWinplex];

export const useSpChipClass = () => CL_SP_CHIP[useUnit($spChip)];
