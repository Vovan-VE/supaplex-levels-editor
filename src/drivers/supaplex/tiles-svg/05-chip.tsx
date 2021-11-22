import { FC } from "react";
import {
  CL_GREY,
  CL_GREY_D,
  CL_GREY_L,
  CL_GREY_XD,
  CL_ORANGE,
  CL_WHITE,
  CL_YELLOW,
} from "./color";

export const TChip: FC = () => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path fill={CL_GREY_D} d="M2,2h12v12h-12z" />
    <path fill={CL_GREY_L} d="M2,2h11v1h-10v10h-1z" />
    <path fill={CL_GREY_XD} d="M13,3h1v11h-11v-1h10z" />
    <path
      fill={CL_GREY}
      d={
        "M5,5h5v1h-5z" +
        "M5,7h1v1h-1z" +
        "M7,7h3v1h-3z" +
        "M5,9h1v1h-1z" +
        "M7,9h1v1h-1z" +
        "M9,9h1v1h-1z"
      }
    />
    <path
      fill={CL_WHITE}
      d={
        "M3,0h1v1h-1z" +
        "M5,0h1v1h-1z" +
        "M7,0h1v1h-1z" +
        "M9,0h1v1h-1z" +
        "M11,0h1v1h-1z" +
        "M13,0h1v1h-1z" +
        "M0,2h1v1h-1z" +
        "M0,4h1v1h-1z" +
        "M0,6h1v1h-1z" +
        "M0,8h1v1h-1z" +
        "M0,10h1v1h-1z" +
        "M0,12h1v1h-1z"
      }
    />
    <path
      fill={CL_ORANGE}
      d={
        "M2,15h1v1h-1z" +
        "M4,15h1v1h-1z" +
        "M6,15h1v1h-1z" +
        "M8,15h1v1h-1z" +
        "M10,15h1v1h-1z" +
        "M12,15h1v1h-1z" +
        "M15,3h1v1h-1z" +
        "M15,5h1v1h-1z" +
        "M15,7h1v1h-1z" +
        "M15,9h1v1h-1z" +
        "M15,11h1v1h-1z" +
        "M15,13h1v1h-1z"
      }
    />
    <path
      fill={CL_YELLOW}
      d={
        "M3,1h1v1h-1z" +
        "M5,1h1v1h-1z" +
        "M7,1h1v1h-1z" +
        "M9,1h1v1h-1z" +
        "M11,1h1v1h-1z" +
        "M13,1h1v1h-1z" +
        "M1,2h1v1h-1z" +
        "M1,4h1v1h-1z" +
        "M1,6h1v1h-1z" +
        "M1,8h1v1h-1z" +
        "M1,10h1v1h-1z" +
        "M1,12h1v1h-1z" +
        "M2,14h1v1h-1z" +
        "M4,14h1v1h-1z" +
        "M6,14h1v1h-1z" +
        "M8,14h1v1h-1z" +
        "M10,14h1v1h-1z" +
        "M12,14h1v1h-1z" +
        "M14,3h1v1h-1z" +
        "M14,5h1v1h-1z" +
        "M14,7h1v1h-1z" +
        "M14,9h1v1h-1z" +
        "M14,11h1v1h-1z" +
        "M14,13h1v1h-1z"
      }
    />
  </svg>
);
