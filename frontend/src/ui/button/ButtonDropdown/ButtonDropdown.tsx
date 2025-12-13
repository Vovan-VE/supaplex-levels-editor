import {
  FC,
  ReactElement,
  ReactNode,
  SyntheticEvent,
  useCallback,
  useState,
} from "react";
import cn from "classnames";
import { Popper, PopperBaseProps, PopperTriggerProps } from "../../helpers";
import { svgs } from "../../icon";
import { Button, ButtonProps } from "../Button";
import cl from "./ButtonDropdown.module.scss";

interface Props extends PopperBaseProps {
  trigger?: ReactNode;
  triggerIcon?: ReactElement;
  buttonClassName?: string;
  buttonProps?: ButtonProps;
  noArrow?: boolean;
  standalone?: ReactElement;
  // onlyAt?: AdaptiveRange;
  isOpened?: boolean;
  children?: ReactNode;
}

export const ButtonDropdown: FC<Props> = ({
  trigger,
  triggerIcon,
  buttonClassName,
  buttonProps,
  noArrow = false,
  standalone,
  // onlyAt,
  isOpened,
  children,
  ...options
}) => {
  const [visible, setVisible] = useState(isOpened ?? false);

  // useMediaQuery({ adaptive: onlyAt, onMismatch: handleHide });

  const renderTrigger = useCallback(
    ({ ref, props, visible }: PopperTriggerProps) => {
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
          {...props}
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
    [trigger, triggerIcon, buttonProps, buttonClassName, noArrow, standalone],
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
        onVisibleChange={setVisible}
      >
        <div onClick={handleClickInside}>{children}</div>
      </Popper>
    </div>
  );
};
