import cn from "classnames";
import { useStore } from "effector-react";
import { FC } from "react";
import { $hasFiles } from "models/levelsets";
import { IconContainer, svgs } from "ui/icon";
import { ContainerProps } from "ui/types";
import { useFinalLayoutIsCompact } from "../layout/useFinalLayoutIsCompact";
import cl from "./NoContent.module.scss";

export const NoFileSelected: FC<ContainerProps> = ({ className, ...rest }) => {
  const hasFiles = useStore($hasFiles);
  const isCompact = useFinalLayoutIsCompact();

  return (
    <div {...rest} className={cn(cl.root, className)}>
      {hasFiles ? "Select a file" : "Open or Create a file"} in{" "}
      {isCompact ? (
        <>
          <IconContainer className={cl.inlineIcon}>
            <svgs.FileBin />
          </IconContainer>{" "}
          Files menu
        </>
      ) : (
        "Files Tabs"
      )}
      .
    </div>
  );
};
