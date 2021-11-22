import { FC } from "react";
import {
  CL_BROWN,
  CL_GREY,
  CL_GREY_D,
  CL_GREY_L,
  CL_GREY_XD,
  CL_GREY_XL,
  CL_ORANGE,
  CL_RED_D,
  CL_RED_L,
} from "./color";

export const TPortCross: FC = () => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill={CL_GREY_XD}
      d="M2,0h12v1h-1v1h-1v2h2v-1h1v-1h1v12h-1v-1h-1v-1h-2v2h1v1h1v1h-12v-1h1v-1h1v-2h-2v1h-1v1h-1v-12h1v1h1v1h2v-2h-1v-1h-1z"
    />
    <path
      fill={CL_GREY_D}
      d="M0,3h1v1h-1z M3,0h1v1h-1z M0,8h16v3h-1v-1h-14v1h-1z M8,0h3v1h-1v14h1v1h-3z"
    />
    <path fill={CL_GREY} d="M4,0h4v16h-4z M0,4h16v4h-16z" />
    <path
      fill={CL_GREY_L}
      d="M4,0h1v1h-1z M0,4h1v1h-1z M4,15h1v1h-1z M15,4h1v1h-1z"
    />
    <path fill={CL_GREY_XL} d="M5,0h1v16h-1z M0,5h16v1h-16z" />

    <path fill={CL_RED_D} d="M4,2h8v2h2v8h-2v2h-8v-2h-2v-8h2z" />
    <path
      fill={CL_RED_L}
      d={
        "M6,2h1v12h-1z M2,6h12v1h-12z" +
        "M5,3h4v1h-4z M6,9h3v1h-3z M5,11h4v1h-4z M5,13h4v1h-4z" +
        "M2,5h1v4h-1z M4,5h1v4h-1z M8,5h1v4h-1z M10,5h1v4h-1z M12,5h1v4h-1z"
      }
    />
    <path
      fill={CL_ORANGE}
      d={
        "M6,3h1v1h-1z M6,5h1v1h-1z M6,7h1v1h-1z M6,9h1v1h-1z M6,11h1v1h-1z M6,13h1v1h-1z" +
        "M2,6h1v1h-1z M4,6h1v1h-1z M8,6h1v1h-1z M10,6h1v1h-1z M12,6h1v1h-1z"
      }
    />
    <path
      fill={CL_BROWN}
      d={
        "M4,2h1v1h-1z M3,4h1v1h-1z M13,4h1v1h-1z M9,5h1v1h-1z M5,9h1v1h-1z" +
        "M9,2h3v3h-1v-2h-2z M3,9h1v2h1v2h-1v-1h-1z M11,9h1v4h-2v-1h1v-1h-1v-1h1z M13,9h1v3h-1z"
      }
    />
  </svg>
);
