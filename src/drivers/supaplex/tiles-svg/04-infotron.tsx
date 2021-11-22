import { FC } from "react";
import {
  CL_BLUE_D,
  CL_BLUE_L,
  CL_BROWN,
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

export const TInfotron: FC = () => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill={CL_GREEN_D}
      d={
        "M4,2h1v-1h1v-1h2v1h-2v1h-1v4h1v1h-1v-1h-1z" +
        "M10,0h1v1h1v1h-1v-1h-1z" +
        "M11,6h1v1h-1z"
      }
    />
    <path fill={CL_GREEN_L} d="M8,0h2v1h1v1h1v4h-1v-4h-1v-1h-2z" />
    <path
      fill={CL_BLUE_D}
      d="M10,6h1v1h-1z M4,15h1v-1h1v-1h1v-1h1v1h-1v1h-1v1h-1v1h-1z"
    />
    <path fill={CL_BLUE_L} d="M8,10h1v-1h1v1h-1v2h-1z M10,7h1v1h-1z" />
    <path fill={CL_YELLOW} d="M3,8h3v1h-3z" />
    <path fill={CL_ORANGE} d="M6,8h5v1h-5z" />
    <path
      fill={CL_RED_L}
      d="M11,8h3v1h1v1h1v3h-1v-3h-1v-1h-3z M14,14h1v1h-1z"
    />
    <path
      fill={CL_RED_D}
      d="M8,12h1v1h1v2h4v1h-4v-1h-1v-2h-1z M15,13h1v1h-1z"
    />
    <path
      fill={CL_BROWN}
      d="M5,7h1v1h-1z M6,9h1v1h1v2h-1v-2h-1z M15,14h1v1h-1z"
    />

    <path
      fill={CL_WHITE}
      d={
        "M0,10h1v-1h1v1h-1v1h-1z" +
        "M3,11h1v1h-1z" +
        "M11,11h1v1h-1z" +
        "M7,3h1v1h-1z"
      }
    />
    <path fill={CL_GREY_XL} d="M2,8h1v1h-1z M0,11h1v2h-1z" />
    <path fill={CL_GREY_L} d="M0,13h1v1h1v1h-1v-1h-1z" />
    <path
      fill={CL_GREY}
      d={
        "M3,12h1v-1h1v1h-1v1h-1z" +
        "M11,12h1v-1h1v1h-1v1h-1z" +
        "M7,4h1v-1h1v1h-1v1h-1z"
      }
    />
    <path fill={CL_GREY_D} d="M0,9h1v-1h1v1h-1v1h-1z" />
    <path
      fill={CL_GREY_XD}
      d={
        "M5,2h1v-1h1v1h-1v1h-1z" +
        "M2,15h2v1h-2z" +
        "M5,15h1v-1h1v1h-1v1h-1z" +
        "M4,12h1v1h-1z" +
        "M12,12h1v1h-1z" +
        "M8,4h1v1h-1z"
      }
    />
  </svg>
);
