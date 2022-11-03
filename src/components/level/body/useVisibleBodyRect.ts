import { RefObject, startTransition, useEffect, useRef, useState } from "react";
import { RectA } from "utils/rect/types";

type R = RefObject<HTMLDivElement | null>;

const useElementClientSize = (ref: R) => {
  const [width, setWidth] = useState<number>();
  const [height, setHeight] = useState<number>();
  useEffect(() => {
    const el = ref.current;
    if (el) {
      const { width, height } = el.getBoundingClientRect();
      startTransition(() => {
        setWidth(Math.round(width));
        setHeight(Math.round(height));
      });

      const ob = new ResizeObserver((entries) => {
        for (const en of entries) {
          const { width, height } = en.contentRect;
          startTransition(() => {
            setWidth(Math.round(width));
            setHeight(Math.round(height));
          });
        }
      });
      ob.observe(el, { box: "content-box" });

      return () => {
        ob.disconnect();
      };
    }
  }, [ref]);

  return { width, height };
};

const useElementScrollOffset = (ref: R) => {
  const [left, setLeft] = useState(0);
  const [top, setTop] = useState(0);
  useEffect(() => {
    if (ref.current) {
      const el = ref.current;
      function handler() {
        const { scrollLeft, scrollTop } = el;
        startTransition(() => {
          setLeft(Math.round(scrollLeft));
          setTop(Math.round(scrollTop));
        });
      }

      handler();
      el.addEventListener("scroll", handler);
      return () => {
        el.removeEventListener("scroll", handler);
      };
    }
  }, [ref]);

  return { left, top };
};

const VIEWPORT_PADDING = 8;

const getEdgeTiles = (
  viewportLength: number | undefined,
  canvasLength: number | undefined,
  scrollOffset: number,
  tileSize: number,
  maxTiles: number,
): [tileStart: number, tilesCount: number] => {
  if (canvasLength === undefined || viewportLength === undefined) {
    return [0, 0];
  }

  // viewport >= canvas:
  //
  // --------------------------------------------  viewport
  //           -------------------                 canvas
  if (viewportLength >= canvasLength) {
    return [0, maxTiles];
  }

  // viewport < canvas:
  //
  // scroll offset
  // >>>>>>>>>>
  //           -------------------                 viewport
  // --------------------------------------------  canvas
  // ...'''...'''...'''...'''...'''...'''...'''... tiles
  //
  //       [=== taking this tiles ===]
  //
  // abs indices
  let startN = Math.floor((scrollOffset - VIEWPORT_PADDING) / tileSize - 0.25);
  let endN = Math.ceil(
    (scrollOffset + viewportLength + VIEWPORT_PADDING) / tileSize + 0.25,
  );
  // correct indices
  if (startN < 0) {
    startN = 0;
  }
  if (endN > maxTiles) {
    endN = maxTiles;
  }

  return [startN, Math.min(maxTiles, endN - startN)];
};

export const useVisibleBodyRect = (
  width: number,
  height: number,
  bodyScale: number,
) => {
  const refRoot = useRef<HTMLDivElement | null>(null);
  const refCanvas = useRef<HTMLDivElement | null>(null);
  const { width: rootW, height: rootH } = useElementClientSize(refRoot);
  const { left: scrollLeft, top: scrollTop } = useElementScrollOffset(refRoot);
  const { width: canvasW, height: canvasH } = useElementClientSize(refCanvas);

  const [x, w] = getEdgeTiles(rootW, canvasW, scrollLeft, bodyScale, width);
  const [y, h] = getEdgeTiles(rootH, canvasH, scrollTop, bodyScale, height);

  const rect: RectA = [x, y, w, h];
  return {
    refRoot,
    refCanvas,
    rect,
  };
};
