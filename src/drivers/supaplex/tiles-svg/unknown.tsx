import { FC } from "react";
import { CL_GREY_XD } from "./color";

export const TUnknown: FC = () => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill={CL_GREY_XD}
      d="M2,2h1v-1h10v1h1v7h-1v1h-3v2h-4v-3h1v-1h3v-5h-4v2h-4z M6,13h4v2h-4z"
    />
  </svg>
);
