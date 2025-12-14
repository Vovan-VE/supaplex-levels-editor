import { ReactElement, Ref, RefAttributes } from "react";
import cn from "classnames";
import { deleteButtonProps, deleteLinkProps, isLinkProps } from "./attributes";
import { renderContent } from "./renderContent";
import { ButtonCoreProps } from "./types";
import cl from "./ButtonCore.module.scss";

export const buttonCoreRender = ({
  ref,
  icon,
  iconPosition,
  iconStack,
  loading,
  uiColor,
  children,
  ...props
}: ButtonCoreProps &
  RefAttributes<
    HTMLAnchorElement | HTMLButtonElement
  >): ReactElement | null => {
  const content = renderContent(
    { icon, iconPosition, iconStack, loading, uiColor },
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
      <a
        {...deleteButtonProps(props)}
        ref={ref as Ref<HTMLAnchorElement>}
        className={className}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      {...deleteLinkProps(props)}
      ref={ref as Ref<HTMLButtonElement>}
      className={className}
    >
      {content}
    </button>
  );
};
