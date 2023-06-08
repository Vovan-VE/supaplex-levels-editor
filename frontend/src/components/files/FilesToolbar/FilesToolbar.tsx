import { FC } from "react";
import { Button } from "ui/button";
import { svgs } from "ui/icon";
import { promptNewFile } from "./promptNewFile";
import { handleOpenClick } from "./handleOpenClick";

export const FilesToolbar: FC = () => (
  <>
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
  </>
);
