import { ReactElement, ReactNode } from "react";
import { Spinner } from "ui/feedback/Spinner";
import { IconContainer } from "../../icon";
import { IconPosition, OwnProps } from "./types";

interface Options {
  wrapClassName?: string;
  iconClassName?: string;
  textClassName?: string;
  loaderClassName?: string;
}

export const renderContent = (
  { icon, iconPosition, loading = false, uiColor }: OwnProps,
  children: ReactNode,
  {
    wrapClassName,
    iconClassName,
    textClassName,
    loaderClassName,
  }: Options = {},
): ReactElement => (
  <>
    {((
      text = children !== undefined && (
        <span className={textClassName}>{children}</span>
      ),
      ic = icon && (
        <IconContainer className={iconClassName}>{icon}</IconContainer>
      ),
    ) =>
      ic ? (
        <span className={wrapClassName}>
          {iconPosition === IconPosition.END ? (
            <>
              {text}
              {ic}
            </>
          ) : (
            <>
              {ic}
              {text}
            </>
          )}
        </span>
      ) : (
        text
      ))()}

    {loading && (
      <span className={loaderClassName}>
        <Spinner />
      </span>
    )}
  </>
);
