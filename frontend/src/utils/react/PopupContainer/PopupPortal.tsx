import { FC, PropsWithChildren } from "react";
import { createPortal } from "react-dom";
import { PopupPortalOptions, usePopupPortal } from "./usePopupPortal";

export const PopupPortal: FC<PropsWithChildren<PopupPortalOptions>> = ({
  children,
  ...options
}) => {
  const element = usePopupPortal(options);
  return element ? createPortal(children, element) : null;
};
