import { TranslationGetter } from "i18n/types";
import { PenShape } from "ui/drawing";
import { CellContextEventSnapshot } from "ui/grid-events";
import {
  BorderTiles,
  FancyTiles,
  IBaseMetaTile,
  IBaseTileInteraction,
  InteractionType,
} from "../types";
import { SpecPortDialog } from "./SpecPortDialog";
import * as tid from "./tiles-id";
import * as tsrc from "./tiles-svg/index-src";
import SvgMetaPortD from "./tiles-svg/meta-port-d.svg?react";
import SvgMetaPortL from "./tiles-svg/meta-port-l.svg?react";
import SvgMetaPortR from "./tiles-svg/meta-port-r.svg?react";
import SvgMetaPortU from "./tiles-svg/meta-port-u.svg?react";
import SvgMetaPortV from "./tiles-svg/meta-port-v.svg?react";
import SvgMetaPortH from "./tiles-svg/meta-port-h.svg?react";
import SvgMetaPortX from "./tiles-svg/meta-port-x2.svg?react";
import { ISupaplexLevel, ISupaplexTile } from "./types";

const specPInt: IBaseTileInteraction<ISupaplexLevel> = {
  onContextMenu: /*<T extends ISupaplexLevel>*/ (
    cell: CellContextEventSnapshot,
    // _: T,
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

const metaPortTitle =
  (port: TranslationGetter): TranslationGetter =>
  (t) =>
    t("main:supaplex.tilesMeta.Port", { port: port(t) });

const metaPortR: IBaseMetaTile = {
  primaryValue: tid.TILE_PORT_R,
  icon: <SvgMetaPortR />,
  title: metaPortTitle((t) => t("main:supaplex.tiles.PortRight")),
};
const metaPortD: IBaseMetaTile = {
  primaryValue: tid.TILE_PORT_D,
  icon: <SvgMetaPortD />,
  title: metaPortTitle((t) => t("main:supaplex.tiles.PortDown")),
};
const metaPortL: IBaseMetaTile = {
  primaryValue: tid.TILE_PORT_L,
  icon: <SvgMetaPortL />,
  title: metaPortTitle((t) => t("main:supaplex.tiles.PortLeft")),
};
const metaPortU: IBaseMetaTile = {
  primaryValue: tid.TILE_PORT_U,
  icon: <SvgMetaPortU />,
  title: metaPortTitle((t) => t("main:supaplex.tiles.PortUp")),
};
const metaPortV: IBaseMetaTile = {
  primaryValue: tid.TILE_PORT_V,
  icon: <SvgMetaPortV />,
  title: metaPortTitle((t) => t("main:supaplex.tiles.PortV")),
};
const metaPortH: IBaseMetaTile = {
  primaryValue: tid.TILE_PORT_H,
  icon: <SvgMetaPortH />,
  title: metaPortTitle((t) => t("main:supaplex.tiles.PortH")),
};
const metaPortX: IBaseMetaTile = {
  primaryValue: tid.TILE_PORT_X,
  icon: <SvgMetaPortX />,
  title: metaPortTitle((t) => t("main:supaplex.tiles.PortX")),
};

export const tiles: readonly ISupaplexTile[] = [
  {
    value: tid.TILE_SPACE,
    title: (t) => t("main:supaplex.tiles.Empty"),
    toolbarOrder: TBOrder.Core,
  },
  {
    value: tid.TILE_ZONK,
    title: (t) => t("main:supaplex.tiles.Zonk"),
    src: tsrc.src01,
    toolbarOrder: TBOrder.Core,
  },
  {
    value: tid.TILE_BASE,
    title: (t) => t("main:supaplex.tiles.Base"),
    src: tsrc.src02,
    toolbarOrder: TBOrder.Core,
  },
  {
    value: tid.TILE_MURPHY,
    title: (t) => t("main:supaplex.tiles.Murphy"),
    src: tsrc.src03,
    toolbarOrder: TBOrder.Core,
  },
  {
    value: tid.TILE_INFOTRON,
    title: (t) => t("main:supaplex.tiles.Infotron"),
    src: tsrc.src04,
    toolbarOrder: TBOrder.Core,
  },
  {
    value: tid.TILE_CHIP,
    title: (t) => t("main:supaplex.tiles.Chip"),
    src: tsrc.src05,
    toolbarOrder: TBOrder.Chip,
  },
  {
    value: tid.TILE_HARDWARE,
    title: (t) => t("main:supaplex.tiles.Hardware"),
    src: tsrc.src06,
    toolbarOrder: TBOrder.Core,
  },
  {
    value: tid.TILE_EXIT,
    title: (t) => t("main:supaplex.tiles.Exit"),
    src: tsrc.src07,
    toolbarOrder: TBOrder.Core,
  },
  {
    value: tid.TILE_DISK_O,
    title: (t) => t("main:supaplex.tiles.DiskOrange"),
    src: tsrc.src08,
    toolbarOrder: TBOrder.Disk,
  },
  {
    value: tid.TILE_PORT_R,
    title: (t) => t("main:supaplex.tiles.PortRight"),
    src: tsrc.src09,
    metaTile: metaPortR,
    interaction: specPInt,
    toolbarOrder: TBOrder.Port,
  },
  {
    value: tid.TILE_PORT_D,
    title: (t) => t("main:supaplex.tiles.PortDown"),
    src: tsrc.src10,
    metaTile: metaPortD,
    interaction: specPInt,
    toolbarOrder: TBOrder.Port,
  },
  {
    value: tid.TILE_PORT_L,
    title: (t) => t("main:supaplex.tiles.PortLeft"),
    src: tsrc.src11,
    metaTile: metaPortL,
    interaction: specPInt,
    toolbarOrder: TBOrder.Port,
  },
  {
    value: tid.TILE_PORT_U,
    title: (t) => t("main:supaplex.tiles.PortUp"),
    src: tsrc.src12,
    metaTile: metaPortU,
    interaction: specPInt,
    toolbarOrder: TBOrder.Port,
  },
  {
    value: tid.TILE_SP_PORT_R,
    title: (t) =>
      t("main:supaplex.tiles.SpecPort", {
        port: t("main:supaplex.tiles.PortRight"),
      }),
    src: tsrc.src13,
    metaTile: metaPortR,
    interaction: specPInt,
    // toolbarOrder: TBOrder.SpPort,
  },
  {
    value: tid.TILE_SP_PORT_D,
    title: (t) =>
      t("main:supaplex.tiles.SpecPort", {
        port: t("main:supaplex.tiles.PortDown"),
      }),
    src: tsrc.src14,
    metaTile: metaPortD,
    interaction: specPInt,
    // toolbarOrder: TBOrder.SpPort,
  },
  {
    value: tid.TILE_SP_PORT_L,
    title: (t) =>
      t("main:supaplex.tiles.SpecPort", {
        port: t("main:supaplex.tiles.PortLeft"),
      }),
    src: tsrc.src15,
    metaTile: metaPortL,
    interaction: specPInt,
    // toolbarOrder: TBOrder.SpPort,
  },
  {
    value: tid.TILE_SP_PORT_U,
    title: (t) =>
      t("main:supaplex.tiles.SpecPort", {
        port: t("main:supaplex.tiles.PortUp"),
      }),
    src: tsrc.src16,
    metaTile: metaPortU,
    interaction: specPInt,
    // toolbarOrder: TBOrder.SpPort,
  },
  {
    value: tid.TILE_SNIK_SNAK,
    title: (t) => t("main:supaplex.tiles.SnikSnak"),
    src: tsrc.src17,
    toolbarOrder: TBOrder.Enemy,
  },
  {
    value: tid.TILE_DISK_Y,
    title: (t) => t("main:supaplex.tiles.DiskYellow"),
    src: tsrc.src18,
    toolbarOrder: TBOrder.Disk,
  },
  {
    value: tid.TILE_TERMINAL,
    title: (t) => t("main:supaplex.tiles.Terminal"),
    src: tsrc.src19,
    toolbarOrder: TBOrder.Trigger,
  },
  {
    value: tid.TILE_DISK_R,
    title: (t) => t("main:supaplex.tiles.DiskRed"),
    src: tsrc.src20,
    toolbarOrder: TBOrder.Disk,
  },
  {
    value: tid.TILE_PORT_V,
    title: (t) => t("main:supaplex.tiles.PortV"),
    src: tsrc.src21,
    srcVariant: new Map().set(1, tsrc.src21v1),
    metaTile: metaPortV,
    interaction: specPInt,
    toolbarOrder: TBOrder.Port,
  },
  {
    value: tid.TILE_PORT_H,
    title: (t) => t("main:supaplex.tiles.PortH"),
    src: tsrc.src22,
    srcVariant: new Map().set(1, tsrc.src22v1),
    metaTile: metaPortH,
    interaction: specPInt,
    toolbarOrder: TBOrder.Port,
  },
  {
    value: tid.TILE_PORT_X,
    title: (t) => t("main:supaplex.tiles.PortX"),
    src: tsrc.src23,
    srcVariant: new Map().set(1, tsrc.src23v1),
    metaTile: metaPortX,
    interaction: specPInt,
    toolbarOrder: TBOrder.Port,
  },
  {
    value: tid.TILE_ELECTRON,
    title: (t) => t("main:supaplex.tiles.Electron"),
    src: tsrc.src24,
    toolbarOrder: TBOrder.Enemy,
  },
  {
    value: tid.TILE_BUG,
    title: (t) => t("main:supaplex.tiles.Bug"),
    src: tsrc.src25,
    toolbarOrder: TBOrder.Trigger,
  },
  {
    value: tid.TILE_CHIP_L,
    title: (t) => t("main:supaplex.tiles.ChipLeft"),
    src: tsrc.src26,
    toolbarOrder: TBOrder.Chip,
    drawStruct: { [PenShape._2x1]: { setTiles: [undefined, tid.TILE_CHIP_R] } },
  },
  {
    value: tid.TILE_CHIP_R,
    title: (t) => t("main:supaplex.tiles.ChipRight"),
    src: tsrc.src27,
    toolbarOrder: TBOrder.Chip,
  },
  {
    value: tid.TILE_HW_CIRCULAR,
    title: (t) => t("main:supaplex.tiles.Hardware28"),
    src: tsrc.src28,
    toolbarOrder: TBOrder.FancyHw,
  },
  {
    value: tid.TILE_HW_LAMP_G,
    title: (t) => t("main:supaplex.tiles.HardwareLampGreen"),
    src: tsrc.src29,
    toolbarOrder: TBOrder.FancyHw,
  },
  {
    value: tid.TILE_HW_LAMP_B,
    title: (t) => t("main:supaplex.tiles.HardwareLampBlue"),
    src: tsrc.src30,
    toolbarOrder: TBOrder.FancyHw,
  },
  {
    value: tid.TILE_HW_LAMP_R,
    title: (t) => t("main:supaplex.tiles.HardwareLampRed"),
    src: tsrc.src31,
    toolbarOrder: TBOrder.FancyHw,
  },
  {
    value: tid.TILE_HW_STRIPES,
    title: (t) => t("main:supaplex.tiles.HardwareStripes"),
    src: tsrc.src32,
    toolbarOrder: TBOrder.FancyHw,
  },
  {
    value: tid.TILE_HW_RES,
    title: (t) => t("main:supaplex.tiles.Hardware33"),
    src: tsrc.src33,
    toolbarOrder: TBOrder.FancyHw,
  },
  {
    value: tid.TILE_HW_CAP,
    title: (t) => t("main:supaplex.tiles.HardwareCapacitor"),
    src: tsrc.src34,
    toolbarOrder: TBOrder.FancyHw,
  },
  {
    value: tid.TILE_HW_RES_VAR,
    title: (t) => t("main:supaplex.tiles.Hardware35"),
    src: tsrc.src35,
    toolbarOrder: TBOrder.FancyHw,
  },
  {
    value: tid.TILE_HW_RES_VERT,
    title: (t) => t("main:supaplex.tiles.Hardware36"),
    src: tsrc.src36,
    toolbarOrder: TBOrder.FancyHw,
  },
  {
    value: tid.TILE_HW_RES_HORZ,
    title: (t) => t("main:supaplex.tiles.Hardware37"),
    src: tsrc.src37,
    toolbarOrder: TBOrder.FancyHw,
  },
  {
    value: tid.TILE_CHIP_T,
    title: (t) => t("main:supaplex.tiles.ChipTop"),
    src: tsrc.src38,
    toolbarOrder: TBOrder.Chip,
    drawStruct: { [PenShape._1x2]: { setTiles: [undefined, tid.TILE_CHIP_B] } },
  },
  {
    value: tid.TILE_CHIP_B,
    title: (t) => t("main:supaplex.tiles.ChipBottom"),
    src: tsrc.src39,
    toolbarOrder: TBOrder.Chip,
  },
  {
    value: tid.TILE_INVIS_WALL,
    title: (t) => t("main:supaplex.tiles.Invisible"),
    src: tsrc.src40,
  },
];

export const borderTiles: BorderTiles = new Set([tid.TILE_HARDWARE]);

export const fancyTiles: FancyTiles = new Map([
  [tid.TILE_HW_CIRCULAR, tid.TILE_HARDWARE],
  [tid.TILE_HW_LAMP_G, tid.TILE_HARDWARE],
  [tid.TILE_HW_LAMP_B, tid.TILE_HARDWARE],
  [tid.TILE_HW_LAMP_R, tid.TILE_HARDWARE],
  [tid.TILE_HW_STRIPES, tid.TILE_HARDWARE],
  [tid.TILE_HW_RES, tid.TILE_HARDWARE],
  [tid.TILE_HW_CAP, tid.TILE_HARDWARE],
  [tid.TILE_HW_RES_VAR, tid.TILE_HARDWARE],
  [tid.TILE_HW_RES_VERT, tid.TILE_HARDWARE],
  [tid.TILE_HW_RES_HORZ, tid.TILE_HARDWARE],

  [tid.TILE_CHIP_L, tid.TILE_CHIP],
  [tid.TILE_CHIP_R, tid.TILE_CHIP],
  [tid.TILE_CHIP_T, tid.TILE_CHIP],
  [tid.TILE_CHIP_B, tid.TILE_CHIP],
]);
