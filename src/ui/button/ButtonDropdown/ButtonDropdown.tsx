import {
  FC,
  ReactElement,
  ReactNode,
  SyntheticEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import cn from "classnames";
import { useRefHandlers } from "utils/react";
import { AdaptiveRange, useMediaQuery } from "../../adaptive";
import {
  ClickOutside,
  Popper,
  PopperBaseProps,
  PopperTriggerProps,
  PopperVisibilityEvents,
} from "../../helpers";
import { svgs } from "../../icon";
import { Button, ButtonProps } from "../Button";
import cl from "./ButtonDropdown.module.scss";

interface Props extends PopperBaseProps, PopperVisibilityEvents {
  trigger?: ReactNode;
  triggerIcon?: ReactElement;
  buttonClassName?: string;
  buttonProps?: ButtonProps;
  noArrow?: boolean;
  standalone?: ReactElement;
  onlyAt?: AdaptiveRange;
  isOpened?: boolean;
  closeOnClickOutside?: boolean;
  children?: ReactNode;
}

export const ButtonDropdown: FC<Props> = ({
  trigger,
  triggerIcon,
  buttonClassName,
  buttonProps,
  noArrow = false,
  standalone,
  onlyAt,
  isOpened,
  closeOnClickOutside = true,
  children,
  onShow,
  onHide,
  ...options
}) => {
  const [visible, setVisible] = useState(isOpened ?? false);
  const handleShow = useCallback(() => setVisible(true), []);
  const handleHide = useCallback(() => setVisible(false), []);
  {
    useEffect(() => {
      if (undefined !== isOpened) {
        setVisible(isOpened);
      }
    }, [isOpened]);
    const refShow = useRefHandlers(onShow);
    const refHide = useRefHandlers(onHide);
    useEffect(() => {
      if (visible) {
        refShow.current?.();
      } else {
        refHide.current?.();
      }
    }, [visible, refShow, refHide]);
  }

  useMediaQuery({ adaptive: onlyAt, onMismatch: handleHide });

  const renderTrigger = useCallback(
    ({ ref, visible }: PopperTriggerProps) => {
      const triggerButton = (
        <Button
          icon={triggerIcon}
          {...buttonProps}
          ref={standalone ? undefined : ref}
          className={cn(
            cl.button,
            buttonClassName,
            buttonProps?.className,
            trigger === undefined && cl._noTrigger,
          )}
          onClick={handleShow}
        >
          {trigger}
          {noArrow || (
            <svgs.ArrowTriangleUp
              className={cn(cl.arrow, visible && cl._opened)}
            />
          )}
        </Button>
      );

      if (!standalone) {
        return triggerButton;
      }

      return (
        <div ref={ref} className={cl.wrapButton}>
          {standalone}
          {triggerButton}
        </div>
      );
    },
    [
      trigger,
      triggerIcon,
      buttonProps,
      buttonClassName,
      handleShow,
      noArrow,
      standalone,
    ],
  );

  const handleClickInside = useCallback((e: SyntheticEvent) => {
    if (!e.isDefaultPrevented()) {
      setVisible(false);
    }
  }, []);

  return (
    <div className={cl.container}>
      <Popper
        visible={visible}
        trigger={renderTrigger}
        placement="bottom-start"
        {...options}
        popperClassName={cn(cl.popup, options.popperClassName)}
      >
        <ClickOutside
          watch={closeOnClickOutside && visible}
          onClickOutside={handleHide}
        >
          {({ getClickProps }) => (
            <div {...getClickProps()} onClick={handleClickInside}>
              {/*<div ref={foo}>*/}
              {children}
              {/*</div>*/}
            </div>
          )}
        </ClickOutside>
      </Popper>
    </div>
  );
};
