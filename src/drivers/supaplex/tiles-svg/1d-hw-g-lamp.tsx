import { FC } from "react";
import {
  CL_GREEN_D,
  CL_GREEN_L,
  CL_GREY_D,
  CL_GREY_L,
  CL_GREY_XD,
  CL_GREY_XL,
} from "./color";

export const THwLampGreen: FC = () => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path fill={CL_GREY_D} d="M0,0h16v16h-16z" />
    <path
      fill={CL_GREY_XD}
      d="M1,15h1v-1h12v-12h1v-1h1v15h-15 M5,4h5v1h1v2h1v4h-1v1h-4v-1h-2v-1h-1v-5h1z"
    />
    <path fill={CL_GREY_L} d="M0,0h15v1h-1v1h-12v12h-1v1h-1z" />
    <path
      fill={CL_GREEN_D}
      d="M6,4h3v1h1v1l1,3v1h-1v1h-1l-3,-1h-1v-1h-1v-3h2z"
    />
    <path fill={CL_GREEN_L} d="M8,6h3v3h-1v1h-1v1h-3v-3h1v-1h1z" />
    <path fill={CL_GREY_XL} d="M5,5h1v1h-1z" />
  </svg>
);
