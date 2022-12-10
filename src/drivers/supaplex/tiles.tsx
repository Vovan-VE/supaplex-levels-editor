import { CellContextEventSnapshot } from "models/levels/tools/interface";
import { IBaseTileInteraction, InteractionType } from "../types";
import { SpecPortDialog } from "./SpecPortDialog";
import * as tid from "./tiles-id";
import { ISupaplexLevel, ISupaplexTile } from "./types";

const specPInt: IBaseTileInteraction<ISupaplexLevel> = {
  onContextMenu: <T extends ISupaplexLevel>(
    cell: CellContextEventSnapshot,
    _: T,
  ) => ({
    type: InteractionType.DIALOG,
    cell,
    Component: SpecPortDialog,
  }),
};

export const tiles: readonly ISupaplexTile[] = [
  { value: tid.TILE_SPACE, title: "Space" },
  { value: tid.TILE_ZONK, title: "Zonk" },
  { value: tid.TILE_BASE, title: "Base" },
  { value: tid.TILE_MURPHY, title: "Murphy" },
  { value: tid.TILE_INFOTRON, title: "Infotron" },
  { value: tid.TILE_CHIP, title: "Chip" },
  { value: tid.TILE_HARDWARE, title: "Hardware" },
  { value: tid.TILE_EXIT, title: "Exit" },
  { value: tid.TILE_DISK_O, title: "Orange Disk" },
  { value: tid.TILE_PORT_R, title: "Port Right" },
  { value: tid.TILE_PORT_D, title: "Port Down" },
  { value: tid.TILE_PORT_L, title: "Port Left" },
  { value: tid.TILE_PORT_U, title: "Port Up" },
  {
    value: tid.TILE_SP_PORT_R,
    title: "Special Port Right",
    interaction: specPInt,
  },
  {
    value: tid.TILE_SP_PORT_D,
    title: "Special Port Down",
    interaction: specPInt,
  },
  {
    value: tid.TILE_SP_PORT_L,
    title: "Special Port Left",
    interaction: specPInt,
  },
  {
    value: tid.TILE_SP_PORT_U,
    title: "Special Port Up",
    interaction: specPInt,
  },
  { value: tid.TILE_SNIK_SNAK, title: "Snik-Snak" },
  { value: tid.TILE_DISK_Y, title: "Yellow Disk" },
  { value: tid.TILE_TERMINAL, title: "Terminal" },
  { value: tid.TILE_DISK_R, title: "Red Disk" },
  { value: tid.TILE_PORT_V, title: "Port Vertical" },
  { value: tid.TILE_PORT_H, title: "Port Horizontal" },
  { value: tid.TILE_PORT_X, title: "Port Cross" },
  { value: tid.TILE_ELECTRON, title: "Electron" },
  { value: tid.TILE_BUG, title: "Bug" },
  { value: tid.TILE_CHIP_L, title: "Chip Left" },
  { value: tid.TILE_CHIP_R, title: "Chip Right" },
  { value: tid.TILE_HW_CIRCULAR, title: "Hardware Circular" },
  { value: tid.TILE_HW_LAMP_G, title: "Hardware Lamp Green" },
  { value: tid.TILE_HW_LAMP_B, title: "Hardware Lamp Blue" },
  { value: tid.TILE_HW_LAMP_R, title: "Hardware Lamp Red" },
  { value: tid.TILE_HW_STRIPES, title: "Hardware Stripes" },
  { value: tid.TILE_HW_RES, title: "Hardware Resistor" },
  { value: tid.TILE_HW_CAP, title: "Hardware Capacitor" },
  { value: tid.TILE_HW_RES_VAR, title: "Hardware Resistors various" },
  { value: tid.TILE_HW_RES_VERT, title: "Hardware Resistors vertical" },
  { value: tid.TILE_HW_RES_HORZ, title: "Hardware Resistors horizontal" },
  { value: tid.TILE_CHIP_T, title: "Chip Top" },
  { value: tid.TILE_CHIP_B, title: "Chip Bottom" },
  { value: tid.TILE_INVIS_WALL, title: "Invisible Wall" },
];
