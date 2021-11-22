import { FC } from "react";
import {
  CL_BROWN,
  CL_GREY,
  CL_GREY_D,
  CL_GREY_XD,
  CL_RED_D,
  CL_RED_L,
} from "./color";

export const TSnikSnak: FC = () => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path fill={CL_RED_D} d="M5,10h5v1h-5z" />
    <path
      fill={CL_BROWN}
      d={
        "M2,11h2v2h-2z M2,14h2v2h-2z M11,11h2v2h-2z M11,14h2v2h-2z" +
        "M5,14h2v2h-2z M8,14h2v2h-2z" +
        "M7,10h1v5h-1z M5,12h5v1h-5z"
      }
    />
    <path
      fill={CL_RED_L}
      d={
        "M2,12h1v-1h3v-1h1v5h-1v1h-3v-1h-1z" +
        "M3,12v3h3v-3z" +
        "M8,10h1v1h3v1h1v3h-1v1h-3v-1h-1z" +
        "M9,12v3h3v-3z"
      }
    />

    <path
      fill={CL_GREY_D}
      d="M5,1h1l1,-1h1l1,1h1v6l-1,1v1h-1v-1h-1v1h-1v-1l-1,-1z"
    />
    <path fill={CL_GREY_XD} d="M5,7h1v1h-1z M9,7h1v1h-1z" />
    <path fill={CL_GREY} d="M6,0h1v7h1v-7h1v8h-3z M6,9h3v1h-3z" />
  </svg>
);
