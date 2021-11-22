import { FC } from "react";
import { CL_GREY_XD } from "./color";

export const TInvisWall: FC = () => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill={CL_GREY_XD}
      d={
        "M1,1h2v1h-1v1h-1z" +
        "M13,1h2v2h-1v-1h-1v-1z" +
        "M14,13h1v2h-2v-1h1z" +
        "M1,13h1v1h1v1h-2z" +
        "M4,1h2v1h-2z M7,1h2v1h-2z M10,1h2v1h-2z" +
        "M4,14h2v1h-2z M7,14h2v1h-2z M10,14h2v1h-2z" +
        "M1,4h1v2h-1z M1,7h1v2h-1z M1,10h1v2h-1z" +
        "M14,4h1v2h-1z M14,7h1v2h-1z M14,10h1v2h-1z"
      }
    />
  </svg>
);
