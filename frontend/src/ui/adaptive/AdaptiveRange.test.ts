import { LAYOUT_BREAKPOINT } from "styles/constants";
import { adaptiveRangeToString } from "./AdaptiveRange";

it("query", () => {
  expect(adaptiveRangeToString("md")).toEqual(
    `(min-width: ${LAYOUT_BREAKPOINT.MD}px)`,
  );
  expect(adaptiveRangeToString(["md"])).toEqual(
    `(min-width: ${LAYOUT_BREAKPOINT.MD}px)`,
  );
  expect(adaptiveRangeToString(["<=xs", "md"])).toEqual(
    `(max-width: ${LAYOUT_BREAKPOINT.SM - 0.02}px),(min-width: ${
      LAYOUT_BREAKPOINT.MD
    }px)`,
  );
  expect(adaptiveRangeToString(["xs..sm", "lg"])).toEqual(
    `(max-width: ${LAYOUT_BREAKPOINT.MD - 0.02}px),(min-width: ${
      LAYOUT_BREAKPOINT.LG
    }px)`,
  );
  expect(adaptiveRangeToString(["sm..md", "xl"])).toEqual(
    `(min-width: ${LAYOUT_BREAKPOINT.SM}px) and (max-width: ${
      LAYOUT_BREAKPOINT.LG - 0.02
    }px),(min-width: ${LAYOUT_BREAKPOINT.XL}px)`,
  );
});
