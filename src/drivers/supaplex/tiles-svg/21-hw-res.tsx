import { FC } from "react";
import {
  CL_BLUE_D,
  CL_BLUE_L,
  CL_GREEN_D,
  CL_GREEN_L,
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

export const THwRes: FC = () => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path fill={CL_GREEN_D} d="M0,0h16v16h-16z" />
    <path fill={CL_GREEN_L} d="M1,3h1v7h1v3h-2z M14,3h1v9h-1z" />
    <path fill={CL_GREY_L} d="M2,3h6v1h-6z M2,5h6v1h-6z" />
    <path
      fill={CL_GREY_XD}
      d={
        "M5,2h2v7h-2z M8,1h1v7h-1z M10,2h2v7h-2z" +
        "M13,3h1v1h-1z M13,7h1v1h-1z" +
        "M3,12h12v1h-2v1h-8v-1h-2z"
      }
    />
    <path fill={CL_GREY_D} d="M13,2h1v1h-1z M13,6h1v1h-1z" />
    <path fill={CL_GREY_XL} d="M12,3h1v1h-1z M12,7h1v1h-1z M2,11h12v1h-12z" />
    <path fill={CL_YELLOW} d="M4,10h8v2h-8z" />
    <path fill={CL_WHITE} d="M12,2h1v1h-1z M12,6h1v1h-1z M4,10h1v1h-1z" />
    <path fill={CL_ORANGE} d="M4,12h8v1h-8z M8,10h1v2h-1z" />
    <path fill={CL_RED_L} d="M8,12h1v1h-1z M8,2h1v5h-1z" />
    <path fill={CL_RED_D} d="M9,1h1v7h-1z" />
    <path fill={CL_BLUE_L} d="M7,10h1v2h-1z M3,2h1v5h-1z" />
    <path fill={CL_BLUE_D} d="M7,12h1v1h-1z M4,1h1v7h-1z" />
  </svg>
);
