import { FC } from "react";
import { CL_BLUE_D, CL_BLUE_L, CL_GREY_XL, CL_WHITE } from "./color";

export const TElectron: FC = () => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill={CL_BLUE_D}
      d={
        "M4,2h1v5h-1z M2,4h5v1h-5z" +
        "M12,1h1v5h-1z M10,3h5v1h-5z" +
        "M7,7h1v3h-1z M6,8h3v1h-3z" +
        "M12,8h1v7h-1z M9,11h7v1h-7z M11,10h3v3h-3z" +
        "M3,13h1v1h-1z"
      }
    />
    <path
      fill={CL_BLUE_L}
      d={
        "M4,3h1v3h-1z M3,4h3v1h-3z" +
        "M12,2h1v3h-1z M11,3h3v1h-3z" +
        "M7,8h1v1h-1z" +
        "M12,9h1v5h-1z M10,11h5v1h-5z"
      }
    />
    <path fill={CL_GREY_XL} d="M12,11v-1h1v1h1v1h-1v1h-1v-1h-1v-1z" />
    <path fill={CL_WHITE} d="M12,11h1v1h-1z M12,3h1v1h-1z M4,4h1v1h-1z" />
  </svg>
);
