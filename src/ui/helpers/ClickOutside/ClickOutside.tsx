import {
  FC,
  ReactElement,
  RefCallback,
  useCallback,
  useEffect,
  useRef,
} from "react";

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
  getClickProps: <P>(
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
  onClickOutside?: () => void;
}

export const ClickOutside: FC<Props> = ({
  children,
  watch = true,
  onClickOutside,
}) => {
  const nodeRef = useRef<HTMLElement | null>(null);

  const getClickProps = useCallback(
    <P extends Partial<ChildrenExtraProps>>(
      props?: P,
    ): ChildrenExtraProps & P => {
      const { ref, ...rest } = props ?? {};
      return {
        ...(rest as P),
        ref: (instance: HTMLElement | null) => {
          ref?.(instance);
          nodeRef.current = instance;
        },
      };
    },
    [],
  );

  const hasChildrenCallback = Boolean(children);
  useEffect(() => {
    if (!watch || !onClickOutside || !hasChildrenCallback) {
      // nothing to init
      // nothing to free
      return;
    }

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
        const node = nodeRef.current;
        if (node && !node.contains(target as any)) {
          document.addEventListener("pointerup", _onPointerUpOnce, true);
          document.addEventListener("click", _onClickOnce, true);
          document.addEventListener("pointercancel", _onPointerCancel, true);
        }
      }
    };

    document.addEventListener("pointerdown", _onPointerDown, true);

    return () => {
      document.removeEventListener("pointerdown", _onPointerDown, true);

      // At this version `onClickOutside` callback is triggered only after
      // `pointerup` & `click` handlers, so it should be safe to remove that
      // handlers here.
      document.removeEventListener("pointerup", _onPointerUpOnce, true);
      document.removeEventListener("click", _onClickOnce, true);
      document.removeEventListener("pointercancel", _onPointerCancel, true);
    };
  }, [onClickOutside, watch, hasChildrenCallback]);

  if (!children) {
    return null;
  }

  return children({ getClickProps }) || null;
};
