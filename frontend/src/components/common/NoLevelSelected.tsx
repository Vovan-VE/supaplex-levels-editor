import cn from "classnames";
import { FC } from "react";
import { Trans } from "i18n/Trans";
import { IconContainer, svgs } from "ui/icon";
import { ContainerProps } from "ui/types";
import { constComponent } from "utils/react";
import { useFinalLayoutIsCompact } from "../layout/useFinalLayoutIsCompact";
import cl from "./NoContent.module.scss";

const components = {
  levelsMenu: constComponent(({ children }) => (
    <>
      <IconContainer className={cl.inlineIcon}>
        <svgs.ListOrdered />
      </IconContainer>{" "}
      {children}
    </>
  )),
};

export const NoLevelSelected: FC<ContainerProps> = ({ className, ...rest }) => {
  const isCompact = useFinalLayoutIsCompact();

  return (
    <div {...rest} className={cn(cl.root, className)}>
      {isCompact ? (
        <Trans
          i18nKey="main:levels.notActivated.SelectCompact"
          components={components}
        />
      ) : (
        <Trans i18nKey="main:levels.notActivated.SelectFull" />
      )}
    </div>
  );
};
