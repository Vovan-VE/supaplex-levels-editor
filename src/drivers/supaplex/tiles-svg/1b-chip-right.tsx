import { FC } from "react";
import {
  CL_GREY,
  CL_GREY_D,
  CL_GREY_XD,
  CL_ORANGE,
  CL_WHITE,
  CL_YELLOW,
} from "./color";

export const TChipRight: FC = () => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill={CL_WHITE}
      d={
        "M1,0h1v1h-1z" +
        "M3,0h1v1h-1z" +
        "M5,0h1v1h-1z" +
        "M7,0h1v1h-1z" +
        "M9,0h1v1h-1z" +
        "M11,0h1v1h-1z" +
        "M13,0h1v1h-1z"
      }
    />
    <path
      fill={CL_ORANGE}
      d={
        "M1,15h1v1h-1z" +
        "M3,15h1v1h-1z" +
        "M5,15h1v1h-1z" +
        "M7,15h1v1h-1z" +
        "M9,15h1v1h-1z" +
        "M11,15h1v1h-1z" +
        "M13,15h1v1h-1z"
      }
    />
    <path
      fill={CL_YELLOW}
      d={
        "M1,1h1v14h-1z" +
        "M3,1h1v14h-1z" +
        "M5,1h1v14h-1z" +
        "M7,1h1v14h-1z" +
        "M9,1h1v14h-1z" +
        "M11,1h1v14h-1z" +
        "M13,1h1v14h-1z"
      }
    />
    <path fill={CL_GREY_D} d="M0,2h16v12h-16z" />
    <path fill={CL_GREY_XD} d="M6,7h2v2h-2z M0,13h15v-10h1v11h-16" />
    <path
      fill={CL_GREY}
      d="M0,2h15v1h-15z M7,8h1v1h-1z M0,7h1v-1h1v1h-1v1h-1z M1,9h1v1h-1z"
    />
  </svg>
);
