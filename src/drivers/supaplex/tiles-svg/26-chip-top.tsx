import { FC } from "react";
import {
  CL_GREY,
  CL_GREY_D,
  CL_GREY_XD,
  CL_ORANGE,
  CL_WHITE,
  CL_YELLOW,
} from "./color";

export const TChipTop: FC = () => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill={CL_WHITE}
      d={
        "M0,1h1v1h-1z M0,3h1v1h-1z M0,5h1v1h-1z M0,7h1v1h-1z" +
        "M0,9h1v1h-1z M0,11h1v1h-1z M0,13h1v1h-1z M0,15h1v1h-1z"
      }
    />
    <path
      fill={CL_ORANGE}
      d={
        "M15,1h1v1h-1z M15,3h1v1h-1z M15,5h1v1h-1z M15,7h1v1h-1z" +
        "M15,9h1v1h-1z M15,11h1v1h-1z M15,13h1v1h-1z M15,15h1v1h-1z"
      }
    />
    <path
      fill={CL_YELLOW}
      d={
        "M1,1h14v1h-14z M1,3h14v1h-14z M1,5h14v1h-14z M1,7h14v1h-14z" +
        "M1,9h14v1h-14z M1,11h14v1h-14z M1,13h14v1h-14z M1,15h14v1h-14z"
      }
    />
    <path fill={CL_GREY_D} d="M2,0h12v16h-12z" />
    <path
      fill={CL_GREY_XD}
      d="M7,6h2v2h-2z M6,0h1v3h1v1h-1v-1h-1z M13,0h1v16h-1z"
    />
    <path
      fill={CL_GREY}
      d={
        "M8,7h1v1h-1z M2,0h4v1h-3v15h-1z M9,0h3v1h-2v1h-1z" +
        "M7,12h1v1h-1v1h1v1h-1v-1h-1v-1h1z M9,12h1v3h-1z"
      }
    />
  </svg>
);
