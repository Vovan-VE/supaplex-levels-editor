import { createEffect, createEvent, sample } from "effector";
import { saveFileAs } from "backend";
import { getDriver, IBaseLevel } from "drivers";
import { ColorType } from "ui/types";
import { UndoQueue } from "utils/data";
import { getImage } from "utils/image";
import { Rect } from "utils/rect";
import {
  $currentDriverName,
  $currentFileName,
  $currentLevelIndex,
  $currentLevelUndoQueue,
} from "../levelsets";
import { showToast, showToastError } from "../ui/toasts";
import { $selectionRect } from "./tools/_selection";

export const exportAsImageToClipboard = createEvent<any>();
export const exportAsImageToFile = createEvent<any>();

interface ExportImgParams {
  filename: string;
  levelIndex: number;
  undoQueue: UndoQueue<IBaseLevel>;
  driverName: string;
  selection: Rect | null;
}
const MIME_PNG = "image/png";

const copyRegionImageToClipboardFx = createEffect((params: ExportImgParams) =>
  window.navigator.clipboard.write([
    new ClipboardItem({ [MIME_PNG]: buildImageBlobFx(params) }),
  ]),
);
const saveRegionToImageFileFx = createEffect(
  async (params: ExportImgParams) => {
    const blob = await buildImageBlobFx(params);
    saveFileAs(blob, blob.name);
  },
);
copyRegionImageToClipboardFx.done.watch(() =>
  showToast({ message: "Image copied", color: ColorType.SUCCESS }),
);
for (const [clock, target] of [
  [exportAsImageToClipboard, copyRegionImageToClipboardFx],
  [exportAsImageToFile, saveRegionToImageFileFx],
] as const) {
  sample({
    clock,
    source: {
      filename: $currentFileName,
      levelIndex: $currentLevelIndex,
      undoQueue: $currentLevelUndoQueue,
      driverName: $currentDriverName,
      selection: $selectionRect,
    },
    filter: (p): p is ExportImgParams =>
      Boolean(
        p.filename && p.levelIndex !== null && p.undoQueue && p.driverName,
      ),
    target,
  });
}

// TODO: have no ideas where should it be and should it be configurable
const TILE_SIZE = 16;
const P_UNDEFINED = Promise.resolve(undefined);

const buildImageBlobFx = createEffect(
  ({
    filename,
    levelIndex,
    undoQueue,
    driverName,
    selection,
  }: ExportImgParams) => {
    const { tiles } = getDriver(driverName)!;

    const level = undoQueue.current;
    const { x: fromX = 0, y: fromY = 0 } = selection ?? {};
    const { width, height } = selection ?? level;

    // const canvas = new OffscreenCanvas(96, 96);
    const canvas = document.createElement("canvas");
    canvas.width = width * TILE_SIZE;
    canvas.height = height * TILE_SIZE;

    // const blob = (canvas as any).convertToBlob();
    return new Promise<Blob>(async (resolve, reject) => {
      const images = new Map<number, Promise<HTMLImageElement | undefined>>();
      const getTileImage = (tile: number) => {
        let p = images.get(tile);
        if (p) {
          return p;
        }
        const url = tiles[tile]?.src;
        p = url
          ? getImage(url).catch((e) => {
              console.error("Tile", tile, "image failed", e);
              return undefined;
            })
          : P_UNDEFINED;
        images.set(tile, p);
        return p;
      };

      try {
        const ctx = canvas.getContext("2d")! as any as CanvasRenderingContext2D;
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, width * TILE_SIZE, height * TILE_SIZE);

        await Promise.all(
          Array.from(
            level.tilesRenderStream(fromX, fromY, width, height),
            async ([x, y, w, tile]) => {
              const image = await getTileImage(tile);
              if (!image) {
                return;
              }
              const dy = (y - fromY) * TILE_SIZE;
              for (let i = w; i-- > 0; ) {
                ctx.drawImage(
                  image,
                  (x - fromX + i) * TILE_SIZE,
                  dy,
                  TILE_SIZE,
                  TILE_SIZE,
                );
              }
            },
          ),
        );

        ctx.save();

        canvas.toBlob((b) => {
          if (b) {
            resolve(
              new File([b], `${filename}.${levelIndex + 1}.png`, {
                type: b.type,
              }),
            );
          } else {
            reject(new Error("toBlob() failed"));
          }
        }, MIME_PNG);
      } catch (e) {
        reject(e);
      }
    });
  },
);
buildImageBlobFx.fail.watch(showToastError);