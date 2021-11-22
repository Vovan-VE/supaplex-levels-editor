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

export const TPortUp: FC = () => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill={CL_GREY_XD}
      d="M0,0h16v1h-1v1h-1v9h1v2h1v3h-16v-3h1v-2h1v-9h-1v-1h-1z"
    />
    <path
      fill={CL_GREY_D}
      d="M1,0h11v1h-1v12h1v3h-11v-3h1v-2h1v-1l-1,-8v-1h-1z"
    />
    <path fill={CL_GREY} d="M3,11v-1h5v2h1v4h-2z" />
    <path fill={CL_GREY_L} d="M2,0h5v16h-5v-3h1v-2h1v-1l-1,-8v-1h-1z" />
    <path
      fill={CL_GREY_XL}
      d="M3,0h2v11h1v1h-1v1h1v1h-1v1h1v1h-3v-3h1v-12h-1z"
    />

    <path fill={CL_RED_D} d="M2,2zh12v8h-12z" />
    <path
      fill={CL_RED_L}
      d="M3,3h5v1h-5z M3,5h5v1h-5z M3,7h5v1h-5z M3,9h5v1h-5z M4,2h1v8h-1z"
    />
    <path
      fill={CL_ORANGE}
      d="M4,3h2v1h-2z M4,5h2v1h-2z M4,7h2v1h-2z M4,9h2v1h-2z"
    />
    <path
      fill={CL_BROWN}
      d={
        "M2,2h1v1h-1z M2,4h1v1h-1z M2,6h1v1h-1z M2,8h1v1h-1z" +
        "M10,2h4v1h-4z M10,4h4v1h-4z M10,6h4v1h-4z M10,8h4v1h-4z"
      }
    />
  </svg>
);
