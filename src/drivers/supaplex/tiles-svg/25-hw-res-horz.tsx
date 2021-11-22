import { FC } from "react";
import {
  CL_BLUE_D,
  CL_BLUE_L,
  CL_GREEN_D,
  CL_GREY_XD,
  CL_GREY_XL,
  CL_ORANGE,
  CL_RED_L,
  CL_WHITE,
  CL_YELLOW,
} from "./color";

export const THwResHorz: FC = () => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path fill={CL_GREEN_D} d="M0,0h16v16h-16z" />
    <path
      fill={CL_GREY_XD}
      d={
        "M2,3h14v1h-3v1h-8v-1h-3z" +
        "M2,8h14v1h-3v1h-8v-1h-3z" +
        "M2,13h14v1h-3v1h-8v-1h-3z"
      }
    />
    <path fill={CL_GREY_XL} d="M1,2h14v1h-14z M1,7h14v1h-14z M1,12h14v1h-14z" />

    <path fill={CL_YELLOW} d="M4,1h8v2h-8z M4,6h8v2h-8z M4,11h8v2h-8z" />
    <path
      fill={CL_ORANGE}
      d={
        "M4,3h8v1h-8z M4,8h8v1h-8z M4,13h8v1h-8z" +
        "M8,1h1v2h-1z M8,6h1v2h-1z M8,11h1v2h-1z"
      }
    />
    <path fill={CL_WHITE} d="M4,1h1v1h-1z M4,6h1v1h-1z M4,11h1v1h-1z" />

    <path fill={CL_BLUE_L} d="M7,1h1v2h-1z M7,6h1v2h-1z M7,11h1v2h-1z" />
    <path fill={CL_BLUE_D} d="M7,3h1v1h-1z M7,8h1v1h-1z M7,13h1v1h-1z" />

    <path fill={CL_RED_L} d="M8,3h1v1h-1z M8,8h1v1h-1z M8,13h1v1h-1z" />
  </svg>
);
