import { FC } from "react";
import {
  CL_BLUE_D,
  CL_BLUE_L,
  CL_GREEN_D,
  CL_GREEN_L,
  CL_GREY,
  CL_GREY_L,
  CL_GREY_XD,
  CL_GREY_XL,
  CL_ORANGE,
  CL_RED_D,
  CL_RED_L,
  CL_YELLOW,
} from "./color";

export const THwResVert: FC = () => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path fill={CL_GREEN_D} d="M0,0h16v16h-16z" />
    <path
      fill={CL_GREY_XD}
      d="M3,2h1v3h1v8h-1v3h-1z M8,2h1v3h1v8h-1v3h-1z M13,2h1v3h1v8h-1v3h-1z"
    />
    <path fill={CL_GREY_L} d="M2,2h1v13h-1 M7,2h1v13h-1 M12,2h1v13h-1" />
    <path fill={CL_GREY_XL} d="M2,1h1v1h-1z M7,1h1v1h-1z M12,1h1v1h-1z" />
    <path fill={CL_RED_L} d="M1,4h2v8h-2z M6,4h2v8h-2z M11,4h2v8h-2z" />
    <path fill={CL_RED_D} d="M3,4h1v8h-1z M8,4h1v8h-1z M13,4h1v8h-1z" />
    <path fill={CL_GREY} d="M1,4h1v1h-1z M6,4h1v1h-1z M11,4h1v1h-1z" />
    <path fill={CL_BLUE_L} d="M1,7h2v1h-2z M6,7h2v1h-2z M11,7h2v1h-2z" />
    <path fill={CL_BLUE_D} d="M3,7h1v1h-1z M8,7h1v1h-1z M13,7h1v1h-1z" />
    <path fill={CL_GREEN_L} d="M1,8h2v1h-2z M6,8h2v1h-2z M11,8h2v1h-2z" />
    <path fill={CL_GREEN_D} d="M3,8h1v1h-1z M8,8h1v1h-1z M13,8h1v1h-1z" />
    <path fill={CL_YELLOW} d="M1,9h2v1h-2z M6,9h2v1h-2z M11,9h2v1h-2z" />
    <path fill={CL_ORANGE} d="M3,9h1v1h-1z M8,9h1v1h-1z M13,9h1v1h-1z" />
  </svg>
);
