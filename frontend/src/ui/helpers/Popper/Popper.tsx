import cn from "classnames";
import { FC, ReactElement, ReactNode, useMemo, useState } from "react";
import * as F from "@floating-ui/react";
import cl from "./Popper.module.scss";

interface VisibilityEvents {
  onVisibleChange: (visible: boolean) => void;
}

// export interface PopperVisibilityEvents extends Partial<VisibilityEvents> {}

export interface PopperVisibilityProps extends VisibilityEvents {
  visible: boolean;
}

export interface PopperTriggerProps extends PopperVisibilityProps {
  ref: (el: HTMLElement | null) => void;
  props: object;
}

export interface PopperBaseProps {
  arrowClassName?: string;
  popperClassName?: string;
  placement?: F.Placement;
}

export interface PopperProps
  extends Partial<PopperVisibilityProps>,
    PopperBaseProps {
  trigger: (props: PopperTriggerProps) => ReactElement;
  children?: ReactNode;
  arrow?: boolean;
}

type Middlewares = F.UseFloatingOptions["middleware"];

const ARROW_SIZE = 8;
const noop = () => {};

// TODO: aria-* attributes

export const Popper: FC<PopperProps> = ({
  trigger,
  children,
  arrow = false,
  arrowClassName,
  popperClassName,
  placement,
  visible = true,
  onVisibleChange = noop,
}) => {
  const [arrowElement, setArrowElement] = useState<Element | null>(null);

  const middleware = useMemo<Middlewares>(
    () => [
      F.offset(arrow ? ARROW_SIZE : 0),
      F.flip(),
      F.shift(),
      arrow && F.arrow({ element: arrowElement }),
    ],
    [arrow, arrowElement],
  );
  const { refs, floatingStyles, context, middlewareData } =
    F.useFloating<HTMLElement>({
      open: visible,
      onOpenChange: onVisibleChange,
      middleware,
      whileElementsMounted: F.autoUpdate,
      placement,
    });

  const { getReferenceProps, getFloatingProps } = F.useInteractions([
    F.useClick(context),
    F.useDismiss(context),
    F.useRole(context),
  ]);

  return (
    <>
      {/* eslint-disable-next-line react-hooks/refs */}
      {trigger({
        // eslint-disable-next-line react-hooks/refs
        ref: refs.setReference,
        visible,
        onVisibleChange,
        props: getReferenceProps(),
      })}

      {visible && (
        <F.FloatingFocusManager context={context}>
          <div
            // eslint-disable-next-line react-hooks/refs
            ref={refs.setFloating}
            className={cn(cl.popper, popperClassName)}
            style={floatingStyles}
            {...getFloatingProps()}
          >
            {children}
            {arrow && (
              <div
                ref={setArrowElement}
                className={cn(cl.arrow, arrowClassName)}
                style={{
                  position: "absolute",
                  left: middlewareData.arrow?.x,
                  top: middlewareData.arrow?.y,
                }}
              />
            )}
          </div>
        </F.FloatingFocusManager>
      )}

      {/*/!* https://github.com/popperjs/popper-core/issues/1219 *!/*/}
      {/*/!* https://github.com/popperjs/popper-core/issues/413 *!/*/}
      {/*/!* Don't play with `display: none` or you will hit the bugs above *!/*/}
      {/*{visible && (*/}
      {/*  <div*/}
      {/*    ref={setPopupElement}*/}
      {/*    className={cn(cl.popper, popperClassName)}*/}
      {/*    style={styles["popper"]}*/}
      {/*    {...attributes["popper"]}*/}
      {/*  ></div>*/}
      {/*)}*/}
    </>
  );
};
