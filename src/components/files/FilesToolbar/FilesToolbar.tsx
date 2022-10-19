import { FC } from "react";
import { Button, Toolbar } from "ui/button";
import { svgs } from "ui/icon";
import { ContainerProps } from "ui/types";
import { promptNewFile } from "./promptNewFile";
import { handleOpenClick } from "./handleOpenClick";

export const FilesToolbar: FC<ContainerProps> = (props) => (
  <Toolbar {...props}>
    <Button
      icon={<svgs.FileBlank />}
      title="Create new levelset..."
      onClick={promptNewFile}
    />
    <Button
      icon={<svgs.DirOpen />}
      onClick={handleOpenClick}
      title="Open files..."
    />
  </Toolbar>
);
