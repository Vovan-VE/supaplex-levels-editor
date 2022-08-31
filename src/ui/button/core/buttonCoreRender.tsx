import { ForwardedRef, ReactElement } from "react";
import cn from "classnames";
import { deleteButtonProps, deleteLinkProps, isLinkProps } from "./attributes";
import { renderContent } from "./renderContent";
import { ButtonCoreProps } from "./types";
import cl from "./ButtonCore.module.scss";

export const buttonCoreRender = (
  { icon, iconPosition, loading, uiColor, children, ...props }: ButtonCoreProps,
  ref: ForwardedRef<HTMLAnchorElement | HTMLButtonElement>,
): ReactElement | null => {
  const content = renderContent(
    { icon, iconPosition, loading, uiColor },
    children,
    {
      wrapClassName: cl.wrap,
      iconClassName: cl.icon,
      textClassName: cl.text,
      loaderClassName: cl.loader,
    },
  );

  const className = cn(
    cl.root,
    icon && cl._withIcon,
    loading && cl._loading,
    props.className,
  );

  if (isLinkProps(props) && !props.disabled) {
    return (
      <a {...deleteButtonProps(props)} ref={ref as any} className={className}>
        {content}
      </a>
    );
  }

  return (
    <button {...deleteLinkProps(props)} ref={ref as any} className={className}>
      {content}
    </button>
  );
};
