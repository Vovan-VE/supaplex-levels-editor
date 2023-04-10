import { CellContextEventSnapshot } from "models/levels/tools/interface";
import { IBaseMetaTile, IBaseTileInteraction, InteractionType } from "../types";
import { SpecPortDialog } from "./SpecPortDialog";
import * as tid from "./tiles-id";
import { ReactComponent as SvgMetaPortD } from "./tiles-svg/meta-port-d.svg";
import { ReactComponent as SvgMetaPortL } from "./tiles-svg/meta-port-l.svg";
import { ReactComponent as SvgMetaPortR } from "./tiles-svg/meta-port-r.svg";
import { ReactComponent as SvgMetaPortU } from "./tiles-svg/meta-port-u.svg";
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

const enum TBOrder {
  Core,
  Disk,
  Trigger,
  Enemy,
  Chip,
  Port,
  // SpPort,
  FancyHw,
}

const metaPortTitle = (direction: string) =>
  `Regular/Special Port ${direction}\nRight Click on it in level body to see properties`;
const [metaPortR, metaPortD, metaPortL, metaPortU]: IBaseMetaTile[] = [
  {
    primaryValue: tid.TILE_PORT_R,
    icon: <SvgMetaPortR />,
    title: metaPortTitle("Right"),
  },
  {
    primaryValue: tid.TILE_PORT_D,
    icon: <SvgMetaPortD />,
    title: metaPortTitle("Down"),
  },
  {
    primaryValue: tid.TILE_PORT_L,
    icon: <SvgMetaPortL />,
    title: metaPortTitle("Left"),
  },
  {
    primaryValue: tid.TILE_PORT_U,
    icon: <SvgMetaPortU />,
    title: metaPortTitle("Up"),
  },
];

export const tiles: readonly ISupaplexTile[] = [
  { value: tid.TILE_SPACE, title: "Space", toolbarOrder: TBOrder.Core },
  { value: tid.TILE_ZONK, title: "Zonk", toolbarOrder: TBOrder.Core },
  { value: tid.TILE_BASE, title: "Base", toolbarOrder: TBOrder.Core },
  { value: tid.TILE_MURPHY, title: "Murphy", toolbarOrder: TBOrder.Core },
  { value: tid.TILE_INFOTRON, title: "Infotron", toolbarOrder: TBOrder.Core },
  { value: tid.TILE_CHIP, title: "Chip", toolbarOrder: TBOrder.Chip },
  { value: tid.TILE_HARDWARE, title: "Hardware", toolbarOrder: TBOrder.Core },
  { value: tid.TILE_EXIT, title: "Exit", toolbarOrder: TBOrder.Core },
  { value: tid.TILE_DISK_O, title: "Orange Disk", toolbarOrder: TBOrder.Disk },
  {
    value: tid.TILE_PORT_R,
    title: "Port Right",
    metaTile: metaPortR,
    interaction: specPInt,
    toolbarOrder: TBOrder.Port,
  },
  {
    value: tid.TILE_PORT_D,
    title: "Port Down",
    metaTile: metaPortD,
    interaction: specPInt,
    toolbarOrder: TBOrder.Port,
  },
  {
    value: tid.TILE_PORT_L,
    title: "Port Left",
    metaTile: metaPortL,
    interaction: specPInt,
    toolbarOrder: TBOrder.Port,
  },
  {
    value: tid.TILE_PORT_U,
    title: "Port Up",
    metaTile: metaPortU,
    interaction: specPInt,
    toolbarOrder: TBOrder.Port,
  },
  {
    value: tid.TILE_SP_PORT_R,
    title: "Special Port Right",
    metaTile: metaPortR,
    interaction: specPInt,
    // toolbarOrder: TBOrder.SpPort,
  },
  {
    value: tid.TILE_SP_PORT_D,
    title: "Special Port Down",
    metaTile: metaPortD,
    interaction: specPInt,
    // toolbarOrder: TBOrder.SpPort,
  },
  {
    value: tid.TILE_SP_PORT_L,
    title: "Special Port Left",
    metaTile: metaPortL,
    interaction: specPInt,
    // toolbarOrder: TBOrder.SpPort,
  },
  {
    value: tid.TILE_SP_PORT_U,
    title: "Special Port Up",
    metaTile: metaPortU,
    interaction: specPInt,
    // toolbarOrder: TBOrder.SpPort,
  },
  {
    value: tid.TILE_SNIK_SNAK,
    title: "Snik-Snak",
    toolbarOrder: TBOrder.Enemy,
  },
  { value: tid.TILE_DISK_Y, title: "Yellow Disk", toolbarOrder: TBOrder.Disk },
  {
    value: tid.TILE_TERMINAL,
    title: "Terminal",
    toolbarOrder: TBOrder.Trigger,
  },
  { value: tid.TILE_DISK_R, title: "Red Disk", toolbarOrder: TBOrder.Disk },
  {
    value: tid.TILE_PORT_V,
    title: "Port Vertical",
    toolbarOrder: TBOrder.Port,
  },
  {
    value: tid.TILE_PORT_H,
    title: "Port Horizontal",
    toolbarOrder: TBOrder.Port,
  },
  { value: tid.TILE_PORT_X, title: "Port Cross", toolbarOrder: TBOrder.Port },
  { value: tid.TILE_ELECTRON, title: "Electron", toolbarOrder: TBOrder.Enemy },
  { value: tid.TILE_BUG, title: "Bug", toolbarOrder: TBOrder.Trigger },
  { value: tid.TILE_CHIP_L, title: "Chip Left", toolbarOrder: TBOrder.Chip },
  { value: tid.TILE_CHIP_R, title: "Chip Right", toolbarOrder: TBOrder.Chip },
  {
    value: tid.TILE_HW_CIRCULAR,
    title: "Hardware Circular",
    toolbarOrder: TBOrder.FancyHw,
  },
  {
    value: tid.TILE_HW_LAMP_G,
    title: "Hardware Lamp Green",
    toolbarOrder: TBOrder.FancyHw,
  },
  {
    value: tid.TILE_HW_LAMP_B,
    title: "Hardware Lamp Blue",
    toolbarOrder: TBOrder.FancyHw,
  },
  {
    value: tid.TILE_HW_LAMP_R,
    title: "Hardware Lamp Red",
    toolbarOrder: TBOrder.FancyHw,
  },
  {
    value: tid.TILE_HW_STRIPES,
    title: "Hardware Stripes",
    toolbarOrder: TBOrder.FancyHw,
  },
  {
    value: tid.TILE_HW_RES,
    title: "Hardware Resistor",
    toolbarOrder: TBOrder.FancyHw,
  },
  {
    value: tid.TILE_HW_CAP,
    title: "Hardware Capacitor",
    toolbarOrder: TBOrder.FancyHw,
  },
  {
    value: tid.TILE_HW_RES_VAR,
    title: "Hardware Resistors various",
    toolbarOrder: TBOrder.FancyHw,
  },
  {
    value: tid.TILE_HW_RES_VERT,
    title: "Hardware Resistors vertical",
    toolbarOrder: TBOrder.FancyHw,
  },
  {
    value: tid.TILE_HW_RES_HORZ,
    title: "Hardware Resistors horizontal",
    toolbarOrder: TBOrder.FancyHw,
  },
  { value: tid.TILE_CHIP_T, title: "Chip Top", toolbarOrder: TBOrder.Chip },
  { value: tid.TILE_CHIP_B, title: "Chip Bottom", toolbarOrder: TBOrder.Chip },
  { value: tid.TILE_INVIS_WALL, title: "Invisible Wall" },
];
