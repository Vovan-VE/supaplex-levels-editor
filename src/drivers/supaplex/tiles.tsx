import { CellContextEventSnapshot } from "models/levels/tools";
import { ISupaplexLevel, ISupaplexTile } from "./types";
import { IBaseTileInteraction, InteractionType } from "../types";
import { SpecPortDialog } from "./SpecPortDialog";

/**
 * Chars map
 *
 * Based on [Grom PE]'s level tool. Link to editor in:
 * <https://discord.com/channels/688303837257138197/692085680477831199/692086076696690780>
 *
 * ```
 * map = " o.@&*#ED>v<^)u(n!YTR|-+%:[]0123Z56789/\?W"
 * ;      szbmicheo        sytrpppebcchhhhhhhhhhcciu
 * ;      poaunhaxr p  s p neeeoooluhhwwwwwwwwwwhhnn
 * ;      ansrfiria o  p o ilrdrrregii          iivk
 * ;      ckepopdtn r  e r klm tttc ppcgbrsrcrrrppin
 * ;      e  ht w g t  c t -oid   t   i   teaeee  so
 * ;         yr a e s  i s swnivhcr lrrlllrspssstb w
 * ;          o r      a   n aseoro eicaaai     oown
 * ;          n e d    l   adlkrron fgummmp  vvhpta
 * ;              i        ki  tis  thlpppe  aeo tl
 * ;              s         s   zs   ta   s  rrr ol
 * ;              k         k         r       tz m
 * ```
 */

//            " o.@&*#ED>v<^)u(n!YTR|-+%:[]0123Z56789/\?W"
const chars = " o·@&▢▓ED>v<^⊃∪⊂∩✂YTR|-+✧⚡⊏⊐0123▧56789⊓⊔⬚";
// 00 space ───┘│││┆┆┆┆││││┆┆┆┆││││┆┆┆┆││││┆┆┆┆││││┆┆┆┆││
// 01 zonk ─────┘││┆┆┆┆││││┆┆┆┆││││┆┆┆┆││││┆┆┆┆││││┆┆┆┆││
// 02 base ──────┘│┆┆┆┆││││┆┆┆┆││││┆┆┆┆││││┆┆┆┆││││┆┆┆┆││
// 03 Murphy ─────┘┆┆┆┆││││┆┆┆┆││││┆┆┆┆││││┆┆┆┆││││┆┆┆┆││
// 04 infotron ┄┄┄┄┘┆┆┆││││┆┆┆┆││││┆┆┆┆││││┆┆┆┆││││┆┆┆┆││
// 05 chip ┄┄┄┄┄┄┄┄┄┘┆┆││││┆┆┆┆││││┆┆┆┆││││┆┆┆┆││││┆┆┆┆││
// 06 hardware ┄┄┄┄┄┄┘┆││││┆┆┆┆││││┆┆┆┆││││┆┆┆┆││││┆┆┆┆││
// 07 exit ┄┄┄┄┄┄┄┄┄┄┄┘││││┆┆┆┆││││┆┆┆┆││││┆┆┆┆││││┆┆┆┆││
// 08 orange disk ─────┘│││┆┆┆┆││││┆┆┆┆││││┆┆┆┆││││┆┆┆┆││
// 09 port > ───────────┘││┆┆┆┆││││┆┆┆┆││││┆┆┆┆││││┆┆┆┆││
// 0A port v ────────────┘│┆┆┆┆││││┆┆┆┆││││┆┆┆┆││││┆┆┆┆││
// 0B port < ─────────────┘┆┆┆┆││││┆┆┆┆││││┆┆┆┆││││┆┆┆┆││
// 0C port ^ ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┘┆┆┆││││┆┆┆┆││││┆┆┆┆││││┆┆┆┆││
// 0D spec port > ┄┄┄┄┄┄┄┄┄┄┘┆┆││││┆┆┆┆││││┆┆┆┆││││┆┆┆┆││
// 0E spec port v ┄┄┄┄┄┄┄┄┄┄┄┘┆││││┆┆┆┆││││┆┆┆┆││││┆┆┆┆││
// 0F spec port < ┄┄┄┄┄┄┄┄┄┄┄┄┘││││┆┆┆┆││││┆┆┆┆││││┆┆┆┆││
// 10 spec port ^ ─────────────┘│││┆┆┆┆││││┆┆┆┆││││┆┆┆┆││
// 11 snik-snak ────────────────┘││┆┆┆┆││││┆┆┆┆││││┆┆┆┆││
// 12 yellow disk ───────────────┘│┆┆┆┆││││┆┆┆┆││││┆┆┆┆││
// 13 terminal ───────────────────┘┆┆┆┆││││┆┆┆┆││││┆┆┆┆││
// 14 red disk ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┘┆┆┆││││┆┆┆┆││││┆┆┆┆││
// 15 port vertical ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┘┆┆││││┆┆┆┆││││┆┆┆┆││
// 16 port horizontal ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┘┆││││┆┆┆┆││││┆┆┆┆││
// 17 port cross ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┘││││┆┆┆┆││││┆┆┆┆││
// 18 electron ────────────────────────┘│││┆┆┆┆││││┆┆┆┆││
// 19 bug ──────────────────────────────┘││┆┆┆┆││││┆┆┆┆││
// 1A chip left ─────────────────────────┘│┆┆┆┆││││┆┆┆┆││
// 1B chip right ─────────────────────────┘┆┆┆┆││││┆┆┆┆││
// 1C hw circular ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┘┆┆┆││││┆┆┆┆││
// 1D hw g lamp ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┘┆┆││││┆┆┆┆││
// 1E hw b lamp ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┘┆││││┆┆┆┆││
// 1F hw r lamp ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┘││││┆┆┆┆││
// 20 hw stripes ──────────────────────────────┘│││┆┆┆┆││
// 21 hw res ───────────────────────────────────┘││┆┆┆┆││
// 22 hw cap ────────────────────────────────────┘│┆┆┆┆││
// 23 hw res var ─────────────────────────────────┘┆┆┆┆││
// 24 hw res vert ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┘┆┆┆││
// 25 hw res horz ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┘┆┆││
// 26 chip top ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┘┆││
// 27 chip bottom ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┘││
// 28 invis wall ──────────────────────────────────────┘│
// 29 unknown ──────────────────────────────────────────┘

export const toChar = (cell: number): string =>
  cell >= 0 && cell < chars.length ? chars.charAt(cell) : "W";

export const TILE_SPACE = 0x00;
export const TILE_ZONK = 0x01;
export const TILE_BASE = 0x02;
export const TILE_MURPHY = 0x03;
export const TILE_INFOTRON = 0x04;
export const TILE_CHIP = 0x05;
export const TILE_HARDWARE = 0x06;
export const TILE_EXIT = 0x07;
export const TILE_DISK_O = 0x08;
export const TILE_PORT_R = 0x09;
export const TILE_PORT_D = 0x0a;
export const TILE_PORT_L = 0x0b;
export const TILE_PORT_U = 0x0c;
export const TILE_SP_PORT_R = 0x0d;
export const TILE_SP_PORT_D = 0x0e;
export const TILE_SP_PORT_L = 0x0f;
export const TILE_SP_PORT_U = 0x10;
export const TILE_SNIK_SNAK = 0x11;
export const TILE_DISK_Y = 0x12;
export const TILE_TERMINAL = 0x13;
export const TILE_DISK_R = 0x14;
export const TILE_PORT_V = 0x15;
export const TILE_PORT_H = 0x16;
export const TILE_PORT_X = 0x17;
export const TILE_ELECTRON = 0x18;
export const TILE_BUG = 0x19;
export const TILE_CHIP_L = 0x1a;
export const TILE_CHIP_R = 0x1b;
export const TILE_HW_CIRCULAR = 0x1c;
export const TILE_HW_LAMP_G = 0x1d;
export const TILE_HW_LAMP_B = 0x1e;
export const TILE_HW_LAMP_R = 0x1f;
export const TILE_HW_STRIPES = 0x20;
export const TILE_HW_RES = 0x21;
export const TILE_HW_CAP = 0x22;
export const TILE_HW_RES_VAR = 0x23;
export const TILE_HW_RES_VERT = 0x24;
export const TILE_HW_RES_HORZ = 0x25;
export const TILE_CHIP_T = 0x26;
export const TILE_CHIP_B = 0x27;
export const TILE_INVIS_WALL = 0x28;
// export const TILE__UNKNOWN = 0x29;

export const isSpecPort = (tile: number) =>
  tile === TILE_SP_PORT_R ||
  tile === TILE_SP_PORT_D ||
  tile === TILE_SP_PORT_L ||
  tile === TILE_SP_PORT_U;

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
  { value: TILE_SPACE, title: "Space" },
  { value: TILE_ZONK, title: "Zonk" },
  { value: TILE_BASE, title: "Base" },
  { value: TILE_MURPHY, title: "Murphy" },
  { value: TILE_INFOTRON, title: "Infotron" },
  { value: TILE_CHIP, title: "Chip" },
  { value: TILE_HARDWARE, title: "Hardware" },
  { value: TILE_EXIT, title: "Exit" },
  { value: TILE_DISK_O, title: "Orange Disk" },
  { value: TILE_PORT_R, title: "Port Right" },
  { value: TILE_PORT_D, title: "Port Down" },
  { value: TILE_PORT_L, title: "Port Left" },
  { value: TILE_PORT_U, title: "Port Up" },
  { value: TILE_SP_PORT_R, title: "Special Port Right", interaction: specPInt },
  { value: TILE_SP_PORT_D, title: "Special Port Down", interaction: specPInt },
  { value: TILE_SP_PORT_L, title: "Special Port Left", interaction: specPInt },
  { value: TILE_SP_PORT_U, title: "Special Port Up", interaction: specPInt },
  { value: TILE_SNIK_SNAK, title: "Snik-Snak" },
  { value: TILE_DISK_Y, title: "Yellow Disk" },
  { value: TILE_TERMINAL, title: "Terminal" },
  { value: TILE_DISK_R, title: "Red Disk" },
  { value: TILE_PORT_V, title: "Port Vertical" },
  { value: TILE_PORT_H, title: "Port Horizontal" },
  { value: TILE_PORT_X, title: "Port Cross" },
  { value: TILE_ELECTRON, title: "Electron" },
  { value: TILE_BUG, title: "Bug" },
  { value: TILE_CHIP_L, title: "Chip Left" },
  { value: TILE_CHIP_R, title: "Chip Right" },
  { value: TILE_HW_CIRCULAR, title: "Hardware Circular" },
  { value: TILE_HW_LAMP_G, title: "Hardware Lamp Green" },
  { value: TILE_HW_LAMP_B, title: "Hardware Lamp Blue" },
  { value: TILE_HW_LAMP_R, title: "Hardware Lamp Red" },
  { value: TILE_HW_STRIPES, title: "Hardware Stripes" },
  { value: TILE_HW_RES, title: "Hardware Resistor" },
  { value: TILE_HW_CAP, title: "Hardware Capacitor" },
  { value: TILE_HW_RES_VAR, title: "Hardware Resistors various" },
  { value: TILE_HW_RES_VERT, title: "Hardware Resistors vertical" },
  { value: TILE_HW_RES_HORZ, title: "Hardware Resistors horizontal" },
  { value: TILE_CHIP_T, title: "Chip Top" },
  { value: TILE_CHIP_B, title: "Chip Bottom" },
  { value: TILE_INVIS_WALL, title: "Invisible Wall" },
];
