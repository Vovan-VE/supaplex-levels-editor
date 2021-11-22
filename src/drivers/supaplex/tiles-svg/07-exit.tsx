import { FC } from "react";
import { CL_BLACK, CL_ORANGE, CL_RED_L, CL_WHITE, CL_YELLOW } from "./color";

export const TExit: FC = () => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path fill={CL_ORANGE} d="M0,0h16v16h-16z" />
    <path fill={CL_YELLOW} d="M0,0h15v1h-14v14h-1z" />
    <path fill={CL_RED_L} d="M15,1h1v15h-15v-1h14z" />
    <path fill={CL_BLACK} d="M4,4h10v2h-8v2h6v2h-6v2h8v2h-10z" />
    <path fill={CL_WHITE} d="M3,3h10v2h-8v2h6v2h-6v2h8v2h-10z" />
  </svg>
);
