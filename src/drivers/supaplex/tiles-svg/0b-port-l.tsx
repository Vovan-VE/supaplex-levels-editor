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

export const TPortLeft: FC = () => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill={CL_GREY_XD}
      d="M0,0h1v1h1v1h9v-1h2v-1h3v16h-3v-1h-2v-1h-9v1h-1v1h-1z"
    />
    <path fill={CL_GREY_D} d="M0,1h1v1h1l8,1h1v-1h2v-1h3v11h-3v-1h-12v1h-1z" />
    <path fill={CL_GREY} d="M10,3h1l5,4v2h-4v-1h-2z" />
    <path fill={CL_GREY_L} d="M0,2h1v1h1l8,1h1v-1h2v-1h3v5h-16z" />
    <path
      fill={CL_GREY_XL}
      d="M0,3h1v1h12v-1h3v3h-1v-1h-1v1h-1v-1h-1v1h-1v-1h-1v1h-1v-1h-11z"
    />

    <path fill={CL_RED_D} d="M2,2h8v12h-8z" />
    <path
      fill={CL_RED_L}
      d="M3,3h1v5h-1z M5,3h1v5h-1z M7,3h1v5h-1z M9,3h1v5h-1z M2,4h8v1h-8z"
    />
    <path
      fill={CL_ORANGE}
      d="M3,4h1v2h-1z M5,4h1v2h-1z M7,4h1v2h-1z M9,4h1v2h-1z"
    />
    <path
      fill={CL_BROWN}
      d={
        "M2,2h1v1h-1z M4,2h1v1h-1z M6,2h1v1h-1z M8,2h1v1h-1z" +
        "M2,10h1v4h-1z M4,10h1v4h-1z M6,10h1v4h-1z M8,10h1v4h-1z"
      }
    />
  </svg>
);
