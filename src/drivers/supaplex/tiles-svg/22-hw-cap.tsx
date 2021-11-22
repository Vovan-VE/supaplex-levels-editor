import { FC } from "react";
import {
  CL_BROWN,
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
} from "./color";

export const THwCap: FC = () => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path fill={CL_GREEN_D} d="M0,0h16v16h-16z" />
    <path
      fill={CL_GREEN_L}
      d="M1,1h14v3h-11v1h-2v7h1v2h-2z M2,2v2h1v-1h5v-1z"
    />
    <path fill={CL_WHITE} d="M9,2h1v1h-1z M12,2h1v1h-1z" />
    <path fill={CL_GREY_L} d="M1,7h3v2h-3z M1,10h3v2h-3z" />
    <path
      fill={CL_GREY_XL}
      d="M9,3h1v1h-1z M12,3h1v1h-1z M1,7h1v1h-1z M1,10h1v1h-1z"
    />
    <path fill={CL_GREY_D} d="M10,2h1v1h-1z M13,2h1v1h-1z" />
    <path
      fill={CL_GREY_XD}
      d={
        "M10,3h1v1h-1z M13,3h1v1h-1z" +
        "M4,5h10v2h2v8h-10v-1h-1v-1l-1,-1h-2v-1h2v-2h-2v-1h2z"
      }
    />
    <path fill={CL_RED_L} d="M4,6h10v4h-10z" />
    <path fill={CL_ORANGE} d="M4,7h9v1h-9z" />
    <path fill={CL_RED_D} d="M5,5h8v1h-8z M4,10h10v2h-10z M6,5h1v6h-1z" />
    <path fill={CL_BROWN} d="M6,5h1v1h-1z M6,10h1v3h-1z M4,12h10v1h-10z" />
  </svg>
);
