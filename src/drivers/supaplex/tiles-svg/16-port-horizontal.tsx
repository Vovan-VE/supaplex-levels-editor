import { FC } from "react";
import {
  CL_BROWN,
  CL_GREY_D,
  CL_GREY_L,
  CL_GREY_XD,
  CL_GREY_XL,
  CL_ORANGE,
  CL_RED_D,
  CL_RED_L,
} from "./color";

export const TPortHorizontal: FC = () => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill={CL_GREY_XD}
      d="M0,0h1v1h1v1h12v-1h1v-1h1v16h-1v-1h-1v-1h-12v1h-1v1h-1z"
    />
    <path fill={CL_GREY_D} d="M0,1h1v1h14v-1h1v11h-1v-1h-14v1h-1z" />
    <path fill={CL_GREY_L} d="M0,2h1v1h14v-1h1v5h-16z" />
    <path fill={CL_GREY_XL} d="M0,3h1v1h14v-1h1v2h-16z" />

    <path fill={CL_RED_D} d="M2,2h12v12h-12z" />
    <path
      fill={CL_RED_L}
      d={
        "M2,3h1v5h-1z M4,3h1v5h-1z M6,3h1v5h-1z M8,3h1v5h-1z M10,3h1v5h-1z M12,3h1v5h-1z" +
        "M2,4h12v1h-12z"
      }
    />
    <path
      fill={CL_ORANGE}
      d="M2,4h1v2h-1z M4,4h1v2h-1z M6,4h1v2h-1z M8,4h1v2h-1z M10,4h1v2h-1z M12,4h1v2h-1z"
    />
    <path
      fill={CL_BROWN}
      d={
        "M3,2h1v1h-1z M5,2h1v1h-1z M7,2h1v1h-1z M9,2h1v1h-1z M11,2h1v1h-1z M13,2h1v1h-1z" +
        "M3,10h1v4h-1z M5,10h1v4h-1z M7,10h1v4h-1z M9,10h1v4h-1z M11,10h1v4h-1z M13,10h1v4h-1z"
      }
    />
  </svg>
);
