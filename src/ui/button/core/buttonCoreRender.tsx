import { ForwardedRef, ReactElement } from "react";
import cn from "classnames";
import { deleteButtonProps, deleteLinkProps, isLinkProps } from "./attributes";
import { renderContent } from "./renderContent";
import { ButtonCoreProps, IconPosition } from "./types";
import cl from "./ButtonCore.module.scss";

const CL_ICON_POS: Record<IconPosition, string | undefined> = {
  [IconPosition.START]: cl._iconStart,
  [IconPosition.END]: cl._iconEnd,
};

export const buttonCoreRender = (
  { icon, iconPosition, loading, uiColor, children, ...props }: ButtonCoreProps,
  ref: ForwardedRef<HTMLAnchorElement | HTMLButtonElement>,
): ReactElement | null => {
  const content = renderContent(
    { icon, iconPosition, loading, uiColor },
    children,
    {
      iconClassName: cl.icon,
      textClassName: cl.text,
      loaderClassName: cl.loader,
    },
  );

  const className = cn(
    cl.root,
    icon && [cl._withIcon, CL_ICON_POS[iconPosition ?? IconPosition.START]],
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
