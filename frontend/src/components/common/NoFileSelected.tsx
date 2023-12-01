import cn from "classnames";
import { useStore } from "effector-react";
import { FC } from "react";
import { Trans } from "i18n/Trans";
import { $hasFiles } from "models/levelsets";
import { IconContainer, svgs } from "ui/icon";
import { ContainerProps } from "ui/types";
import { constComponent } from "utils/react";
import { useFinalLayoutIsCompact } from "../layout/useFinalLayoutIsCompact";
import cl from "./NoContent.module.scss";

const components = {
  filesMenu: constComponent(({ children }) => (
    <>
      <IconContainer className={cl.inlineIcon}>
        <svgs.FileBin />
      </IconContainer>{" "}
      {children}
    </>
  )),
};

export const NoFileSelected: FC<ContainerProps> = ({ className, ...rest }) => {
  const hasFiles = useStore($hasFiles);
  const isCompact = useFinalLayoutIsCompact();

  return (
    <div {...rest} className={cn(cl.root, className)}>
      {hasFiles ? (
        isCompact ? (
          <Trans
            i18nKey="main:files.notActivated.SelectCompact"
            components={components}
          />
        ) : (
          <Trans i18nKey="main:files.notActivated.SelectFull" />
        )
      ) : isCompact ? (
        <Trans
          i18nKey="main:files.notActivated.OpenCompact"
          components={components}
        />
      ) : (
        <Trans i18nKey="main:files.notActivated.OpenFull" />
      )}
    </div>
  );
};
