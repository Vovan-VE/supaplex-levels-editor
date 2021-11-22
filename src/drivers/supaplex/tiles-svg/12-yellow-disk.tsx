import { FC } from "react";
import { CL_BLUE_D, CL_GREY_L, CL_WHITE, CL_YELLOW } from "./color";

export const TYellowDisk: FC = () => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path fill={CL_BLUE_D} d="M0,0h15v1h1v15h-16z M1,1v1h1v-1" />
    <path fill={CL_GREY_L} d="M4,10h9v6h-9z M10,11v4h2v-4z" />
    <path fill={CL_WHITE} d="M3,0h11v7h-11z" />
    <path fill={CL_YELLOW} d="M3,0h11v2h-11z" />
  </svg>
);
