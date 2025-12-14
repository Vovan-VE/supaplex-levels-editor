import { FC, RefAttributes } from "react";
import cn from "classnames";
import { ColorType } from "../../types";
import { ButtonCoreProps, buttonCoreRender } from "../core";
import cl from "./Button.module.scss";

type Props = ButtonCoreProps;

const CL_COLOR: Partial<Record<ColorType, string>> = {
  [ColorType.PRIMARY]: cl._primary,
  [ColorType.SUCCESS]: cl._success,
  [ColorType.WARN]: cl._warn,
  [ColorType.DANGER]: cl._danger,
  [ColorType.MUTE]: cl._mute,
};

type RefElement = HTMLAnchorElement | HTMLButtonElement;

const makeButtonRender =
  (rootClassName?: string): FC<Props & RefAttributes<RefElement>> =>
  (props) =>
    buttonCoreRender({
      ...props,
      ref: props.ref,
      className: cn(
        rootClassName,
        CL_COLOR[props.uiColor ?? ColorType.PRIMARY],
        props.className,
      ),
    });

const withOptions =
  <T,>(
    Btn: FC<Props & RefAttributes<RefElement>>,
    handle: (props: Props & T) => Props,
  ): FC<Props & T & RefAttributes<RefElement>> =>
  ({ ref, ...props }) => <Btn ref={ref} {...handle(props as Props & T)} />;

interface ButtonOptions {
  /**
   * Prefer to use `TextButton` instead. This option is for dynamic case to
   * prevent remount between `Button` and `TextButton`.
   */
  asLink?: boolean;
}

export interface ButtonProps extends Props, ButtonOptions {}

export const Button = withOptions(
  makeButtonRender(cl.button),
  ({ asLink = false, className, ...props }: ButtonProps) => ({
    ...props,
    className: cn(className, asLink && cl._asLink),
  }),
);

export const TextButton = makeButtonRender(cl.textButton);

if (import.meta.env.DEV) {
  Button.displayName = "Button";
  TextButton.displayName = "TextButton";
}
