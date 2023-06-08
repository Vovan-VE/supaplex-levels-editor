import cn from "classnames";
import {
  FC,
  ReactElement,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePopper } from "react-popper";
import { Options } from "@popperjs/core";
import cl from "./Popper.module.scss";

interface VisibilityEvents {
  onShow: () => void;
  onHide: () => void;
}

export interface PopperVisibilityEvents extends Partial<VisibilityEvents> {}

export interface PopperVisibilityProps extends VisibilityEvents {
  visible: boolean;
}

export interface PopperTriggerProps extends PopperVisibilityProps {
  ref: (el: HTMLElement | null) => void;
}

export interface PopperBaseProps extends Partial<Options> {
  arrowClassName?: string;
  popperClassName?: string;
}

export interface PopperProps
  extends Partial<PopperVisibilityProps>,
    PopperBaseProps {
  trigger: (props: PopperTriggerProps) => ReactElement;
  children?: ReactNode;
  arrow?: boolean;
}

type HookOptions = Parameters<typeof usePopper>[2];

const ARROW_SIZE = 8;
const noop = () => {};

// TODO: aria-* attributes

export const Popper: FC<PopperProps> = ({
  trigger,
  children,
  arrow = false,
  arrowClassName,
  popperClassName,
  visible = true,
  onShow = noop,
  onHide = noop,
  ...options
}) => {
  const [targetElement, setTargetElement] = useState<Element | null>(null);
  const [popupElement, setPopupElement] = useState<HTMLElement | null>(null);
  const [arrowElement, setArrowElement] = useState<Element | null>(null);

  {
    const hasPopupElement = popupElement !== null;
    useEffect(() => {
      if (hasPopupElement) {
        onShow();
      }
    }, [hasPopupElement, onShow]);
    useEffect(() => {
      if (hasPopupElement) {
        return onHide;
      }
    }, [hasPopupElement, onHide]);
  }

  const config = useMemo(
    (): HookOptions => ({
      ...options,
      modifiers: [
        ...(arrow
          ? [
              {
                name: "offset",
                options: {
                  offset: [0, ARROW_SIZE],
                },
              },
              {
                name: "arrow" as string,
                options: { element: arrowElement },
              },
            ]
          : []),
        ...(options?.modifiers ?? []),
      ],
    }),
    [options, arrow, arrowElement],
  );
  const { attributes, styles /*, update, state*/ } = usePopper(
    targetElement,
    popupElement,
    config,
  );

  return (
    <>
      {trigger({ ref: setTargetElement, visible, onShow, onHide })}

      {/* https://github.com/popperjs/popper-core/issues/1219 */}
      {/* https://github.com/popperjs/popper-core/issues/413 */}
      {/* Don't play with `display: none` or you will hit the bugs above */}
      {visible && (
        <div
          ref={setPopupElement}
          className={cn(cl.popper, popperClassName)}
          style={styles["popper"]}
          {...attributes["popper"]}
        >
          {children}
          {arrow && (
            <div
              ref={setArrowElement}
              className={cn(cl.arrow, arrowClassName)}
              style={styles["arrow"]}
            />
          )}
        </div>
      )}
    </>
  );
};
