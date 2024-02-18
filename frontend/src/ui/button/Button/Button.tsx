import { forwardRef, ForwardRefRenderFunction } from "react";
import cn from "classnames";
import { ColorType } from "../../types";
import { ButtonCoreProps, buttonCoreRender } from "../core";
import cl from "./Button.module.scss";

interface Props extends ButtonCoreProps {}

const CL_COLOR: Partial<Record<ColorType, string>> = {
  [ColorType.PRIMARY]: cl._primary,
  [ColorType.SUCCESS]: cl._success,
  [ColorType.WARN]: cl._warn,
  [ColorType.DANGER]: cl._danger,
  [ColorType.MUTE]: cl._mute,
};

type RefElement = HTMLAnchorElement | HTMLButtonElement;

const makeButtonRender =
  (rootClassName?: string): ForwardRefRenderFunction<RefElement, Props> =>
  (props, ref) =>
    buttonCoreRender(
      {
        ...props,
        className: cn(
          rootClassName,
          CL_COLOR[props.uiColor ?? ColorType.PRIMARY],
          props.className,
        ),
      },
      ref,
    );

const withOptions =
  <T,>(
    renderer: ForwardRefRenderFunction<RefElement, Props>,
    handle: (props: Props & T) => Props,
  ): ForwardRefRenderFunction<RefElement, Props & T> =>
  (props, ref) =>
    renderer(handle(props), ref);

interface ButtonOptions {
  /**
   * Prefer to use `TextButton` instead. This option is for dynamic case to
   * prevent remount between `Button` and `TextButton`.
   */
  asLink?: boolean;
}

export interface ButtonProps extends Props, ButtonOptions {}

export const Button = forwardRef(
  withOptions(
    makeButtonRender(cl.button),
    ({ asLink = false, className, ...props }: ButtonProps) => ({
      ...props,
      className: cn(className, asLink && cl._asLink),
    }),
  ),
);

export interface TextButtonProps extends Props {}

export const TextButton = forwardRef(makeButtonRender(cl.textButton));

if (process.env.NODE_ENV !== "production") {
  Button.displayName = "Button";
  TextButton.displayName = "TextButton";
}
