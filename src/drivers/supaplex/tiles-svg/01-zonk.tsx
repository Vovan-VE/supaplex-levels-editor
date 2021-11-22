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
  CL_YELLOW,
} from "./color";

export const TZonk: FC = () => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path fill={CL_BROWN} d="M2,7h12v2h-12z" />
    <path fill={CL_RED_D} d="M3,7h10v2h-10z" />
    <path fill={CL_RED_L} d="M4,7h8v2h-8z" />
    <path fill={CL_ORANGE} d="M5,7h6v2h-6z" />
    <path fill={CL_YELLOW} d="M7,7h2v2h-2z" />
    <path
      fill={CL_GREY_XD}
      d={
        "M0,7v-2h1v-2h1v-1h1v-1h2v-1h6v1h2v1h1v1h1v2h1v2z" +
        "m0,2h16v2h-1v2v-1v1h-1v1h-1v1h-2v1h-6v-1h-2v-1h-1v-1h-1v-2h-1z"
      }
    />
    <path
      fill={CL_GREY_D}
      d={
        "M1,7v-3h1v-1h1v-1h1v-1h7v1h1v1h1v1h1v3z" +
        "m0,2h13v2h-1v1h-1v1h-1v1h-7v-1h-1v-1h-1v-1h-1z"
      }
    />
    <path
      fill={CL_GREY}
      d="M2,7v-3h1v-1h1v-1h6v1h1v1h1v3z m1,2h8v2h-1v1h-6v-1h-1z"
    />
    <path fill={CL_GREY_L} d="M3,7v-3h1v-1h5v1h1v3z" />
    <path
      fill={CL_GREY_XL}
      d="M4,5h1v1h1v-1h-1v-1h1v1h1v-1h1v1h-1v1h1v-1h1v1h-1v1h-1v-1h-1v1h-1v-1h-1z"
    />
  </svg>
);
