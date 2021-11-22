import { FC } from "react";
import {
  CL_BLACK,
  CL_BROWN,
  CL_GREY,
  CL_ORANGE,
  CL_RED_D,
  CL_RED_L,
  CL_WHITE,
} from "./color";

export const TMurphy: FC = () => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path fill={CL_RED_L} d="M0,5L5,0h6l2,2l2,1v1l1,1v5l-4,4h-8l-4,-4z" />
    <path
      fill={CL_RED_D}
      d={
        "M0,4h1v1h-1z" +
        "M4,0h1v1h-1z" +
        "M11,0h1v1h-1z" +
        "M13,1h1v1h1v1h-1v-1h-1z" +
        "M15,4h1v1h-1z" +
        "M0,9h1v2h1v1h1v1h2v1h6v-1h2v-1h1v-1h1v-1h1v2h-1v1h-1v1h-1v1h-2v1h-6v-1h-2v-1h-1v-1h-1v-1h-1z" +
        "M2,9h2v2h-1v-1h-1z" +
        "M5,10h1v2h5v-2h1v2h-1v1h-5v-1h-1z" +
        "M13,9h2v1h-1v1h-1z"
      }
    />
    <path
      fill={CL_ORANGE}
      d={"M1,3h1v-1h1v-1h1v1h-1v1h-1v1h-1zM11,1h2v1h1v1h-1v-1h-2z"}
    />
    <path
      fill={CL_BROWN}
      d={
        "M2,8h1v1h-1z" +
        "M4,10h1v1h-1z" +
        "M6,11h5v1h-5z" +
        "M12,10h1v1h-1z" +
        "M14,8h1v1h-1z"
      }
    />
    <path fill={CL_WHITE} d="M4,4h1v1h-1z M12,4h1v1h-1z" />
    <path fill={CL_GREY} d="M3,5h1v1h-1z M13,5h1v1h-1z" />
    <path fill={CL_BLACK} d="M4,5h1v1h-1z M12,5h1v1h-1z" />
  </svg>
);
