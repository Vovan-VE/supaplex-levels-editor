import {
  CellContextEventSnapshot,
  PenShape,
} from "models/levels/tools/interface";
import { IBaseMetaTile, IBaseTileInteraction, InteractionType } from "../types";
import { SpecPortDialog } from "./SpecPortDialog";
import * as tid from "./tiles-id";
import * as tsrc from "./tiles-svg/index-src";
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
  {
    value: tid.TILE_ZONK,
    title: "Zonk",
    src: tsrc.src01,
    toolbarOrder: TBOrder.Core,
  },
  {
    value: tid.TILE_BASE,
    title: "Base",
    src: tsrc.src02,
    toolbarOrder: TBOrder.Core,
  },
  {
    value: tid.TILE_MURPHY,
    title: "Murphy",
    src: tsrc.src03,
    toolbarOrder: TBOrder.Core,
  },
  {
    value: tid.TILE_INFOTRON,
    title: "Infotron",
    src: tsrc.src04,
    toolbarOrder: TBOrder.Core,
  },
  {
    value: tid.TILE_CHIP,
    title: "Chip",
    src: tsrc.src05,
    toolbarOrder: TBOrder.Chip,
  },
  {
    value: tid.TILE_HARDWARE,
    title: "Hardware",
    src: tsrc.src06,
    toolbarOrder: TBOrder.Core,
  },
  {
    value: tid.TILE_EXIT,
    title: "Exit",
    src: tsrc.src07,
    toolbarOrder: TBOrder.Core,
  },
  {
    value: tid.TILE_DISK_O,
    title: "Orange Disk",
    src: tsrc.src08,
    toolbarOrder: TBOrder.Disk,
  },
  {
    value: tid.TILE_PORT_R,
    title: "Port Right",
    src: tsrc.src09,
    metaTile: metaPortR,
    interaction: specPInt,
    toolbarOrder: TBOrder.Port,
  },
  {
    value: tid.TILE_PORT_D,
    title: "Port Down",
    src: tsrc.src10,
    metaTile: metaPortD,
    interaction: specPInt,
    toolbarOrder: TBOrder.Port,
  },
  {
    value: tid.TILE_PORT_L,
    title: "Port Left",
    src: tsrc.src11,
    metaTile: metaPortL,
    interaction: specPInt,
    toolbarOrder: TBOrder.Port,
  },
  {
    value: tid.TILE_PORT_U,
    title: "Port Up",
    src: tsrc.src12,
    metaTile: metaPortU,
    interaction: specPInt,
    toolbarOrder: TBOrder.Port,
  },
  {
    value: tid.TILE_SP_PORT_R,
    title: "Special Port Right",
    src: tsrc.src13,
    metaTile: metaPortR,
    interaction: specPInt,
    // toolbarOrder: TBOrder.SpPort,
  },
  {
    value: tid.TILE_SP_PORT_D,
    title: "Special Port Down",
    src: tsrc.src14,
    metaTile: metaPortD,
    interaction: specPInt,
    // toolbarOrder: TBOrder.SpPort,
  },
  {
    value: tid.TILE_SP_PORT_L,
    title: "Special Port Left",
    src: tsrc.src15,
    metaTile: metaPortL,
    interaction: specPInt,
    // toolbarOrder: TBOrder.SpPort,
  },
  {
    value: tid.TILE_SP_PORT_U,
    title: "Special Port Up",
    src: tsrc.src16,
    metaTile: metaPortU,
    interaction: specPInt,
    // toolbarOrder: TBOrder.SpPort,
  },
  {
    value: tid.TILE_SNIK_SNAK,
    title: "Snik-Snak",
    src: tsrc.src17,
    toolbarOrder: TBOrder.Enemy,
  },
  {
    value: tid.TILE_DISK_Y,
    title: "Yellow Disk",
    src: tsrc.src18,
    toolbarOrder: TBOrder.Disk,
  },
  {
    value: tid.TILE_TERMINAL,
    title: "Terminal",
    src: tsrc.src19,
    toolbarOrder: TBOrder.Trigger,
  },
  {
    value: tid.TILE_DISK_R,
    title: "Red Disk",
    src: tsrc.src20,
    toolbarOrder: TBOrder.Disk,
  },
  {
    value: tid.TILE_PORT_V,
    title: "Port Vertical",
    src: tsrc.src21,
    toolbarOrder: TBOrder.Port,
  },
  {
    value: tid.TILE_PORT_H,
    title: "Port Horizontal",
    src: tsrc.src22,
    toolbarOrder: TBOrder.Port,
  },
  {
    value: tid.TILE_PORT_X,
    title: "Port Cross",
    src: tsrc.src23,
    toolbarOrder: TBOrder.Port,
  },
  {
    value: tid.TILE_ELECTRON,
    title: "Electron",
    src: tsrc.src24,
    toolbarOrder: TBOrder.Enemy,
  },
  {
    value: tid.TILE_BUG,
    title: "Bug",
    src: tsrc.src25,
    toolbarOrder: TBOrder.Trigger,
  },
  {
    value: tid.TILE_CHIP_L,
    title: "Chip Left",
    src: tsrc.src26,
    toolbarOrder: TBOrder.Chip,
    drawStruct: { [PenShape._2x1]: { setTiles: [undefined, tid.TILE_CHIP_R] } },
  },
  {
    value: tid.TILE_CHIP_R,
    title: "Chip Right",
    src: tsrc.src27,
    toolbarOrder: TBOrder.Chip,
  },
  {
    value: tid.TILE_HW_CIRCULAR,
    title: "Hardware Circular",
    src: tsrc.src28,
    toolbarOrder: TBOrder.FancyHw,
  },
  {
    value: tid.TILE_HW_LAMP_G,
    title: "Hardware Lamp Green",
    src: tsrc.src29,
    toolbarOrder: TBOrder.FancyHw,
  },
  {
    value: tid.TILE_HW_LAMP_B,
    title: "Hardware Lamp Blue",
    src: tsrc.src30,
    toolbarOrder: TBOrder.FancyHw,
  },
  {
    value: tid.TILE_HW_LAMP_R,
    title: "Hardware Lamp Red",
    src: tsrc.src31,
    toolbarOrder: TBOrder.FancyHw,
  },
  {
    value: tid.TILE_HW_STRIPES,
    title: "Hardware Stripes",
    src: tsrc.src32,
    toolbarOrder: TBOrder.FancyHw,
  },
  {
    value: tid.TILE_HW_RES,
    title: "Hardware Resistor",
    src: tsrc.src33,
    toolbarOrder: TBOrder.FancyHw,
  },
  {
    value: tid.TILE_HW_CAP,
    title: "Hardware Capacitor",
    src: tsrc.src34,
    toolbarOrder: TBOrder.FancyHw,
  },
  {
    value: tid.TILE_HW_RES_VAR,
    title: "Hardware Resistors various",
    src: tsrc.src35,
    toolbarOrder: TBOrder.FancyHw,
  },
  {
    value: tid.TILE_HW_RES_VERT,
    title: "Hardware Resistors vertical",
    src: tsrc.src36,
    toolbarOrder: TBOrder.FancyHw,
  },
  {
    value: tid.TILE_HW_RES_HORZ,
    title: "Hardware Resistors horizontal",
    src: tsrc.src37,
    toolbarOrder: TBOrder.FancyHw,
  },
  {
    value: tid.TILE_CHIP_T,
    title: "Chip Top",
    src: tsrc.src38,
    toolbarOrder: TBOrder.Chip,
    drawStruct: { [PenShape._1x2]: { setTiles: [undefined, tid.TILE_CHIP_B] } },
  },
  {
    value: tid.TILE_CHIP_B,
    title: "Chip Bottom",
    src: tsrc.src39,
    toolbarOrder: TBOrder.Chip,
  },
  { value: tid.TILE_INVIS_WALL, title: "Invisible Wall", src: tsrc.src40 },
];
