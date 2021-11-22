import { FC } from "react";
import { CL_BLACK, CL_GREY_D, CL_GREY_L, CL_GREY_XD, CL_YELLOW } from "./color";

export const THwStripes: FC = () => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path fill={CL_GREY_D} d="M0,0h16v16h-16z" />
    <path fill={CL_GREY_XD} d="M1,15h1v-1h12v-12h1v-1h1v15h-15" />
    <path fill={CL_GREY_L} d="M0,0h15v1h-1v1h-12v12h-1v1h-1z" />
    <path fill={CL_YELLOW} d="M2,2h12v12h-12z" />
    <path
      fill={CL_BLACK}
      d={
        "M3,2h3v1h-1v1h-1v1h-1v1h-1v-3h1z" +
        "M9,2h3v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v-3h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1z" +
        "M4,14v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v3h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1z" +
        "M10,14v-1h1v-1h1v-1h1v-1h1v3h-1v1z"
      }
    />
  </svg>
);
