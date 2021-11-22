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

export const TSpecPortDown: FC = () => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill={CL_GREY_XD}
      d="M0,0h16v3h-1v2h-1v9h1v1h1v1h-16v-1h1v-1h1v-9h-1v-2h-1z"
    />
    <path
      fill={CL_GREY_D}
      d="M1,0h11v3h-1v12h1v1h-11v-1h1v-1l1,-8v-1h-1v-2h-1z"
    />
    <path fill={CL_GREY} d="M3,5l4,-5h2v4h-1v2h-5z" />
    <path fill={CL_GREY_L} d="M2,0h5v16h-5v-1h1v-1l1,-8v-1h-1v-2h-1z" />
    <path
      fill={CL_GREY_XL}
      d="M3,0h3 v1h-1v1h1 v1h-1v1h1 v1h-1v11h-2v-1h1v-12h-1z"
    />

    <path fill={CL_BLUE_L} d="M2,6h12v8h-12z" />
    <path
      fill={CL_GREEN_D}
      d="M3,6h5v1h-5z M3,8h5v1h-5z M3,10h5v1h-5z M3,12h5v1h-5z M4,6h1v8h-1z"
    />
    <path
      fill={CL_GREEN_L}
      d="M4,6h2v1h-2z M4,8h2v1h-2z M4,10h2v1h-2z M4,12h2v1h-2z"
    />
    <path
      fill={CL_BLUE_D}
      d={
        "M2,7h1v1h-1z M2,9h1v1h-1z M2,11h1v1h-1z M2,13h1v1h-1z" +
        "M10,7h4v1h-4z M10,9h4v1h-4z M10,11h4v1h-4z M10,13h4v1h-4z"
      }
    />
  </svg>
);
