import { FC, PropsWithChildren, ReactNode } from "react";
import cn from "classnames";
import { PopupPortal } from "utils/react";
import { TextButton } from "ui/button";
import { svgs } from "ui/icon";
import cl from "./Dialog.module.scss";

type DialogSize = "small" | "large" | "full";
const CL_SIZE: Record<DialogSize, string | undefined> = {
  small: cl._small,
  large: cl._large,
  full: cl._full,
};

interface Props {
  open?: boolean;
  // modal?: boolean;
  closeButton?: boolean;
  unmountOnClose?: boolean;
  size?: DialogSize;
  title?: ReactNode;
  buttons?: ReactNode;
  onClose?: () => void;
}

export const Dialog: FC<PropsWithChildren<Props>> = ({
  open = false,
  // modal = true,
  closeButton = true,
  unmountOnClose = true,
  size,
  title,
  buttons,
  onClose,
  children,
}) => (
  <PopupPortal className={cl.container}>
    {/*modal &&*/ open && <div className={cl.backdrop} />}
    <div className={cn(cl.scrollContainer, open && cl._open)}>
      <dialog open={open} className={cn(cl.dialog, size && CL_SIZE[size])}>
        {closeButton && (
          <TextButton
            icon={<svgs.Cross />}
            onClick={onClose}
            className={cl.close}
          />
        )}
        {(open || !unmountOnClose) && (
          <>
            {title !== undefined && <div className={cl.title}>{title}</div>}
            <div className={cl.body}>{children}</div>
            {buttons !== undefined && (
              <div className={cn(cl.footer, cl._buttons)}>{buttons}</div>
            )}
          </>
        )}
      </dialog>
    </div>
  </PopupPortal>
);
