import { FC } from "react";
import {
  CL_BLUE_D,
  CL_BLUE_L,
  CL_GREEN_D,
  CL_GREEN_L,
  CL_GREY_D,
  CL_GREY_XD,
  CL_GREY_XL,
  CL_WHITE,
} from "./color";

export const TBug: FC = () => (
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
        "M0,13v-1h1v-1h1v-1h-1v-7h1v-1h9v-1h1v-1h1v1h3v1h-1v4h-1v1h-2v-1h-2v1l1,1h2v1h1v2h1v1h1v1h-1v2h-2v1h-1v-1h-1v-1h-3v2h-2v-1h1v-1h-2v1h-4v-2z" +
        "M4,3h-1v1h-1v5h1v2l3,1h5v-1z"
      }
    />
    <path
      fill={CL_BLUE_D}
      d="M2,5h1v-1h1v-1h2v-1h3v1h1v-1h1l2,2v1h-2v1h-1v1h1v2h1v3h-1v-1h-1v-1h-3v1h-1v2h-1v1h-1l-1,-2v-1h1v-1h-1v-2h-1z"
    />
    <path
      fill={CL_BLUE_L}
      d={
        "M3,5h1v-1h1v-1h6v-1h1v3h-6v2h1v-1h2v1h1v1h1v1l-1,1h-1v-1h-2v1h-1v2h-1v1h-1v-5h-1z" +
        "M11,10h1v1h-1z"
      }
    />
    <path
      fill={CL_WHITE}
      d={
        "M2,12h1v1h-1z" +
        "M12,12h1v1h-1z" +
        "M12,2h1v1h-1v1h-1v1h-2v-1h-2v1h-2v2h1v1h2v-1h1v1h1v1h1v1h-1v-1h-1v-1h-1v1h-2v2h-1v1h-1v-1h1v-3h-1v-3h1v-1h2v-1h2v1h2v-1h1z"
      }
    />
    <path fill={CL_GREY_XL} d={"M2,13h1v1h-1z M12,13h1v1h-1z M12,3h1v1h-1z"} />
    <path fill={CL_GREY_D} d={"M3,12h1v1h-1z M13,12h1v1h-1z M13,2h1v1h-1z"} />
    <path fill={CL_GREY_XD} d={"M3,13h1v1h-1z M13,13h1v1h-1z M13,3h1v1h-1z"} />

    <path d="" />
  </svg>
);
