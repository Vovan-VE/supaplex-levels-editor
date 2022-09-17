import {
  FC,
  FormHTMLAttributes,
  PropsWithChildren,
  ReactNode,
  Suspense,
} from "react";
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

type FormProps = Omit<FormHTMLAttributes<HTMLFormElement>, "children">;

const WrapFormMaybe: FC<PropsWithChildren<{ form?: FormProps }>> = ({
  form,
  children,
}) => (form ? <form {...form}>{children}</form> : <>{children}</>);

export interface DialogProps {
  open?: boolean;
  // modal?: boolean;
  closeButton?: boolean;
  closeSetAutoFocus?: boolean;
  unmountOnClose?: boolean;
  size?: DialogSize;
  title?: ReactNode;
  wrapForm?: FormProps;
  buttons?: ReactNode;
  onClose?: () => void;
}

export const Dialog: FC<PropsWithChildren<DialogProps>> = ({
  open = false,
  // modal = true,
  closeButton = true,
  closeSetAutoFocus,
  unmountOnClose = true,
  size,
  title,
  wrapForm,
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
            autoFocus={closeSetAutoFocus}
          />
        )}
        {(open || !unmountOnClose) && (
          <WrapFormMaybe form={wrapForm}>
            {title !== undefined && (
              <div className={cl.title}>
                <Suspense>{title}</Suspense>
              </div>
            )}
            <div className={cl.body}>
              <Suspense>{children}</Suspense>
            </div>
            {buttons !== undefined && (
              <div className={cn(cl.footer, cl._buttons)}>
                <Suspense>{buttons}</Suspense>
              </div>
            )}
          </WrapFormMaybe>
        )}
      </dialog>
    </div>
  </PopupPortal>
);
