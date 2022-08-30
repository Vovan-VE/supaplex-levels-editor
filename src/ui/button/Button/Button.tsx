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
};

const makeButtonRender =
  (
    rootClassName?: string,
  ): ForwardRefRenderFunction<HTMLAnchorElement | HTMLButtonElement, Props> =>
  (props, ref) =>
    buttonCoreRender(
      {
        ...props,
        className: cn(
          rootClassName,
          CL_COLOR[props.uiColor ?? ColorType.PRIMARY],
        ),
      },
      ref,
    );

export const Button = forwardRef(makeButtonRender(cl.button));
export const TextButton = forwardRef(makeButtonRender(cl.textButton));

if (process.env.NODE_ENV !== "production") {
  Button.displayName = "Button";
  TextButton.displayName = "TextButton";
}
