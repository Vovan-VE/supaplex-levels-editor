import cn from "classnames";
import { FC } from "react";
import { IconContainer, svgs } from "ui/icon";
import { ContainerProps } from "ui/types";
import { useFinalLayoutIsCompact } from "../layout/useFinalLayoutIsCompact";
import cl from "./NoContent.module.scss";

export const NoLevelSelected: FC<ContainerProps> = ({ className, ...rest }) => {
  const isCompact = useFinalLayoutIsCompact();

  return (
    <div {...rest} className={cn(cl.root, className)}>
      Select a level in{" "}
      {isCompact ? (
        <>
          <IconContainer className={cl.inlineIcon}>
            <svgs.ListOrdered />
          </IconContainer>{" "}
          Levels menu
        </>
      ) : (
        "Dropdown list"
      )}
      .
    </div>
  );
};
