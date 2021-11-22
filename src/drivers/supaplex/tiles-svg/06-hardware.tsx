import { FC } from "react";
import { CL_GREY_D, CL_GREY_L, CL_GREY_XD, CL_GREY_XL } from "./color";

export const THardware: FC = () => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path fill={CL_GREY_XL} d="M0,0h16v12h-16z" />
    <path fill={CL_GREY_D} d="M5,5h6v3h-6z M0,11h16v5h-16z" />
    <path
      fill={CL_GREY_L}
      d={
        "M0,1h1v1h1v1h1v1h1v8h-1v1h-1v1h-1v1h-1z" +
        "M9,7h1v-1h1v-1h1v6h-1v-1h-1v-1h-1z"
      }
    />
    <path
      fill={CL_GREY_XD}
      d="M4,5h1v1h1v1h1v2h-1v1h-1v1h-1z M12,4h1v-1h1v-1h1v-1h1v14h-1v-1h-1v-1h-1v-1h-1z"
    />
  </svg>
);
