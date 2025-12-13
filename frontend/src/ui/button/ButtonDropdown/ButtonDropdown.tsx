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
  // closeOnClickOutside?: boolean;
  children?: ReactNode;
}

// const HK_ESCAPE: HotKeyShortcuts = [["Escape"], ["Cancel"]];

export const ButtonDropdown: FC<Props> = ({
  trigger,
  triggerIcon,
  buttonClassName,
  buttonProps,
  noArrow = false,
  standalone,
  // onlyAt,
  isOpened,
  // closeOnClickOutside = true,
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

  // const watchClickOutside = closeOnClickOutside && visible;
  // useHotKey({
  //   shortcut: HK_ESCAPE,
  //   handler: useCallback((e: UIEvent) => {
  //     e.preventDefault();
  //     setVisible(false);
  //   }, []),
  //   prepend: true,
  //   disabled: !watchClickOutside,
  // });

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
        {/*<ClickOutside watch={watchClickOutside} onClickOutside={handleHide}>*/}
        {/*  {({ getClickProps }) => (*/}
        <div
          //{...getClickProps()}
          onClick={handleClickInside}
        >
          {/*<div ref={foo}>*/}
          {children}
          {/*</div>*/}
        </div>
        {/*  )}*/}
        {/*</ClickOutside>*/}
      </Popper>
    </div>
  );
};
