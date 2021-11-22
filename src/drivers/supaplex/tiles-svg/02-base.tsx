import { FC } from "react";
import {
  CL_GREEN_D,
  CL_GREEN_L,
  CL_GREY_D,
  CL_GREY_XD,
  CL_GREY_XL,
  CL_WHITE,
} from "./color";

export const TBase: FC = () => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path fill={CL_GREEN_D} d="M0,0H16V16H0z" />
    <path
      fill={CL_GREEN_L}
      d={
        "M0,0h7v1h-6v1h-1z" +
        "M0,13v-1h1v-1h1v-1h-1v-7h1v-1h9v-1h1v-1h1v1h3v1h-1v4h-1v1h-2v-1h-1v-1h-6v1h-1v1h1v1h2v-1h2v1h4v1h1v2h1v1h1v1h-1v2h-2v1h-1v-1h-1v-1h-3v2h-2v-1h1v-1h-2v1h-4v-2z" +
        "M3,3v1h-1v5h1v2h2v1h6v-1h1v-2h-3v1h-2v-1h-3v-1h-1v-3h1v-1h7v-1z"
      }
    />
    <path fill={CL_WHITE} d={"M2,12h1v1h-1z M12,12h1v1h-1z M12,2h1v1h-1z"} />
    <path fill={CL_GREY_XL} d={"M2,13h1v1h-1z M12,13h1v1h-1z M12,3h1v1h-1z"} />
    <path fill={CL_GREY_D} d={"M3,12h1v1h-1z M13,12h1v1h-1z M13,2h1v1h-1z"} />
    <path fill={CL_GREY_XD} d={"M3,13h1v1h-1z M13,13h1v1h-1z M13,3h1v1h-1z"} />
  </svg>
);
