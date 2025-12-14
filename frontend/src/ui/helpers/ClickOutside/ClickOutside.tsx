import { FC, ReactElement, RefCallback, useCallback } from "react";

interface ChildrenExtraProps {
  ref: RefCallback<HTMLElement>;
}

interface ChildrenRenderProps {
  /**
   * Return some props for underlying DOM Element
   *
   * The returned props must be used **only on DOM Element**:
   *
   * ```jsx
   * <ClickOutside onClickOutside={doHide}>
   *   {({ getClickProps }) => (
   *     <>
   *       <div {...getClickProps()}>...</div>
   *     </>
   *   )}
   * </ClickOutside>
   * ```
   * @param props
   */
  getClickProps: <P extends Partial<ChildrenExtraProps>>(
    props?: P,
  ) => ChildrenExtraProps & Omit<P, keyof ChildrenExtraProps>;
}

interface Props {
  children?: (
    props: ChildrenRenderProps,
  ) => ReactElement | null | false | undefined;
  /**
   * Whether to activate document handlers
   *
   * This property should be used when the component is always on the document.
   *
   * ```jsx
   * // conditional rendering
   * <div>
   *   {isVisible && (
   *     <ClickOutside onClickOutside={doHide}>
   *       {({ getClickProps }) => (
   *         <div {...getClickProps()}>...</div>
   *       )}
   *     </ClickOutside>
   *   )}
   * </div>
   *
   * // always mounted
   * <div>
   *   <ClickOutside watch={isVisible} onClickOutside={doHide}>
   *     {({ getClickProps }) => (
   *         <div {...getClickProps()}>
   *           {isVisible && <>...</>}
   *         </div>
   *     )}
   *   </ClickOutside>
   * </div>
   * ```
   */
  watch?: boolean;
  triggerOnDown?: boolean;
  onClickOutside?: () => void;
}

export const ClickOutside: FC<Props> = ({
  children,
  watch = true,
  triggerOnDown = false,
  onClickOutside,
}) => {
  const hasChildrenCallback = !!children;
  const enabled = hasChildrenCallback && watch;
  const getClickProps = useCallback(
    <P extends Partial<ChildrenExtraProps>>(
      props?: P,
    ): ChildrenExtraProps & P => {
      const { ref, ...rest } = props ?? {};
      return {
        ...(rest as P),
        ref: (div: HTMLElement | null) => {
          const cleanup = ref?.(div);

          const cleanup2 =
            enabled && onClickOutside && div
              ? setup(div, triggerOnDown, onClickOutside)
              : null;

          return () => {
            cleanup2?.();
            cleanup?.();
          };
        },
      };
    },
    [enabled, onClickOutside, triggerOnDown],
  );

  if (!children) {
    return null;
  }

  return children({ getClickProps }) || null;
};

function setup(
  node: HTMLElement,
  triggerOnDown: boolean,
  onClickOutside: () => void,
) {
  const _onPointerUpOnce = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
    document.removeEventListener("pointerup", _onPointerUpOnce, true);
  };
  const _onClickOnce = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
    document.removeEventListener("click", _onClickOnce, true);
    onClickOutside();
  };

  const _onPointerCancel = () => {
    document.removeEventListener("pointerup", _onPointerUpOnce, true);
    document.removeEventListener("click", _onClickOnce, true);
    document.removeEventListener("pointercancel", _onPointerCancel, true);
  };

  const _onPointerDown = (event: Event) => {
    const { target } = event;
    if (target) {
      if (!node.contains(target as Node)) {
        event.preventDefault();
        event.stopPropagation();
        if (triggerOnDown) {
          onClickOutside();
        } else {
          document.addEventListener("pointerup", _onPointerUpOnce, true);
          document.addEventListener("click", _onClickOnce, true);
          document.addEventListener("pointercancel", _onPointerCancel, true);
        }
      }
    }
  };

  document.addEventListener("pointerdown", _onPointerDown, true);

  return () => {
    document.removeEventListener("pointerdown", _onPointerDown, true);

    if (!triggerOnDown) {
      // At this version `onClickOutside` callback is triggered only after
      // `pointerup` & `click` handlers, so it should be safe to remove that
      // handlers here.
      document.removeEventListener("pointerup", _onPointerUpOnce, true);
      document.removeEventListener("click", _onClickOnce, true);
      document.removeEventListener("pointercancel", _onPointerCancel, true);
    }
  };
}
