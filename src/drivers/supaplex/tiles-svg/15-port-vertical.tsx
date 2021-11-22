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

export const TPortVertical: FC = () => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill={CL_GREY_XD}
      d="M0,0h16v1h-1v1h-1v12h1v1h1v1h-16v-1h1v-1h1v-12h-1v-1h-1z"
    />
    <path fill={CL_GREY_D} d="M1,0h11v1h-1v14h1v1h-11v-1h1v-14h-1z" />
    <path fill={CL_GREY_L} d="M2,0h5v16h-5v-1h1v-14h-1z" />
    <path fill={CL_GREY_XL} d="M3,0h2v16h-2v-1h1v-14h-1z" />

    <path fill={CL_RED_D} d="M2,2h12v12h-12z" />
    <path
      fill={CL_RED_L}
      d={
        "M3,3h5v1h-5z M3,5h5v1h-5z M3,7h5v1h-5z M3,9h5v1h-5z M3,11h5v1h-5z M3,13h5v1h-5z" +
        "M4,2h1v12h-1z"
      }
    />
    <path
      fill={CL_ORANGE}
      d="M4,3h2v1h-2z M4,5h2v1h-2z M4,7h2v1h-2z M4,9h2v1h-2z M4,11h2v1h-2z M4,13h2v1h-2z"
    />
    <path
      fill={CL_BROWN}
      d={
        "M2,2h1v1h-1z M2,4h1v1h-1z M2,6h1v1h-1z M2,8h1v1h-1z M2,10h1v1h-1z M2,12h1v1h-1z" +
        "M10,2h4v1h-4z M10,4h4v1h-4z M10,6h4v1h-4z M10,8h4v1h-4z M10,10h4v1h-4z M10,12h4v1h-4z"
      }
    />
  </svg>
);
