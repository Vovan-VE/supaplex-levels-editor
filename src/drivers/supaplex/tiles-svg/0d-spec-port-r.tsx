import { FC } from "react";
import {
  CL_BLUE_D,
  CL_BLUE_L,
  CL_GREEN_D,
  CL_GREEN_L,
  CL_GREY,
  CL_GREY_D,
  CL_GREY_L,
  CL_GREY_XD,
  CL_GREY_XL,
} from "./color";

export const TSpecPortRight: FC = () => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill={CL_GREY_XD}
      d="M0,0h3v1h2v1h9v-1h1v-1h1v16h-1v-1h-1v-1h-9v1h-2v1h-3z"
    />
    <path fill={CL_GREY_D} d="M0,1h3v1h2v1h9v-1h1v-1h1v11h-1v-1h-12v1h-3z" />
    <path fill={CL_GREY} d="M5,3h1v5h-2v1h-4v-2z" />
    <path fill={CL_GREY_L} d="M0,2h3v1h2v1h1l8,-1h1v-1h1v5h-16z" />
    <path
      fill={CL_GREY_XL}
      d="M0,3h3v1h12v-1h1v2h-11v1h-1v-1h-1v1h-1v-1h-1v1h-1z"
    />

    <path fill={CL_BLUE_L} d="M6,2h8v12h-8z" />
    <path
      fill={CL_GREEN_D}
      d="M6,3h1v5h-1z M8,3h1v5h-1z M10,3h1v5h-1z M12,3h1v5h-1z M6,4h8v1h-8z"
    />
    <path
      fill={CL_GREEN_L}
      d="M6,4h1v2h-1z M8,4h1v2h-1z M10,4h1v2h-1z M12,4h1v2h-1z"
    />
    <path
      fill={CL_BLUE_D}
      d={
        "M7,2h1v1h-1z M9,2h1v1h-1z M11,2h1v1h-1z M13,2h1v1h-1z" +
        "M7,10h1v4h-1z M9,10h1v4h-1z M11,10h1v4h-1z M13,10h1v4h-1z"
      }
    />
  </svg>
);
