import { FC } from "react";
import {
  CL_BLACK,
  CL_GREEN_L,
  CL_GREY,
  CL_GREY_L,
  CL_GREY_XD,
  CL_GREY_XL,
  CL_RED_L,
  CL_YELLOW,
} from "./color";

export const TTerminal: FC = () => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path fill={CL_GREY} d="M0,0H16v16h-16z" />
    <path
      fill={CL_GREY_XD}
      d={
        "M1,1h10v1h-9v8h-1z" +
        "M15,1h1v15h-15v-1h14v-6h-1v-1h1v-1h-1v-1h1v-1h-1v-1h1v-1h-1v-1h1z" +
        "M2,12h2v2h-2z M5,12h2v2h-2z M8,12h2v2h-2z" +
        "M11,13h1v1h-1z M13,13h1v1h-1z"
      }
    />
    <path
      fill={CL_GREY_XL}
      d={
        "M1,0h14v1h-14v14h-1v-14h1z" +
        "M13,2h1v1h-1z M13,4h1v1h-1z M13,6h1v1h-1z M13,8h1v1h-1z"
      }
    />
    <path
      fill={CL_GREY_L}
      d="M0,0H1v1h-1z M11,2h1v8h-1z M2,12h1v1h-1z M5,12h1v1h-1z M8,12h1v1h-1z"
    />
    <path
      fill={CL_BLACK}
      d="M2,2h9v8h-9z M3,13h1v1h-1z M6,13h1v1h-1z M9,13h1v1h-1z"
    />
    <path fill={CL_YELLOW} d="M11,12h1v1h-1z" />
    <path fill={CL_RED_L} d="M13,12h1v1h-1z" />
    <path
      fill={CL_GREEN_L}
      d={
        "M3,3h3v1h-3z M7,3h2v1h-2z" +
        "M3,5h1v2h-1z M5,5h1v2h-1z M7,5h1v1h-1z M9,5h1v2h-1z" +
        "M3,9h1v1h-1z M5,9h1v1h-1z M8,9h1v1h-1z"
      }
    />
  </svg>
);
