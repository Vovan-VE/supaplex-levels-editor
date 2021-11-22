import { FC } from "react";
import {
  CL_BLUE_L,
  CL_GREEN_D,
  CL_GREEN_L,
  CL_GREY,
  CL_GREY_D,
  CL_GREY_L,
  CL_GREY_XD,
  CL_GREY_XL,
  CL_ORANGE,
  CL_RED_D,
  CL_RED_L,
  CL_WHITE,
  CL_YELLOW,
} from "./color";

export const THwCircular: FC = () => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path fill={CL_GREEN_D} d="M0,0h16v16h-16z" />
    <path
      fill={CL_GREEN_L}
      d="M1,8h1v-1h1l1,1v1h-1v2 h4v-1h1v-2h1v-6h2v1h-1v2h1l3,-1h1v1h-1l-3,1h-1v1h5v1h-1l-4,1h-1v2l-2,2h-4 v1h9v1h-11z"
    />
    <path fill={CL_YELLOW} d="M11,1h3v1h-3z" />
    <path fill={CL_ORANGE} d="M11,2h3v1h-3z" />
    <path fill={CL_RED_L} d="M11,4h3v1h-3z" />
    <path fill={CL_RED_D} d="M11,5h3v1h-3z" />

    <path fill={CL_GREY} d="M2,2h5v5h-5z M11,8h2v5h-2z" />
    <path
      fill={CL_GREY_D}
      d="M3,11h1v1h-1z M8,11h1v1h-1z M10,13h1v1h-1z M13,7h1v1h-1z"
    />
    <path
      fill={CL_GREY_XD}
      d="M3,12h1v1h-1z M8,12h1v1h-1z M11,13h2v-5h1v6h-3z M4,8l2,-1l2,-2h1v2h-1v2h-4z"
    />
    <path
      fill={CL_GREY_L}
      d="M3,3h1v1h-1z M10,7h3v1h-2v5h-1z M12,9h1v1h-1z M12,11h1v1h-1z"
    />
    <path fill={CL_GREY_XL} d="M2,12h1v1h-1z M7,12h1v1h-1z" />
    <path fill={CL_WHITE} d="M2,11h1v1h-1z M7,11h1v1h-1z" />
    <path
      fill={CL_BLUE_L}
      d="M3,1h3v1h1v1h1v3h-1v1h-1v1h-3v-1h-1v-1h-1v-3h1v-1h1z M3,2v1h-1v3h1v1h3v-1h1v-3h-1v-1z"
    />
  </svg>
);
