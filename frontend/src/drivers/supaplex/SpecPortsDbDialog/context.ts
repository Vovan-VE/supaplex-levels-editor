import { createContext } from "react";
import { ITilesRegion } from "../../types";

export const CLevel = createContext<ITilesRegion | null>(null);
