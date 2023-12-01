import { FC } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "ui/button";
import { svgs } from "ui/icon";
import { promptNewFile } from "./promptNewFile";
import { handleOpenClick } from "./handleOpenClick";

export const FilesToolbar: FC = () => {
  const { t } = useTranslation();
  return (
    <>
      <Button
        icon={<svgs.FileBlank />}
        title={t("main:files.buttons.New")}
        onClick={promptNewFile}
      />
      <Button
        icon={<svgs.DirOpen />}
        onClick={handleOpenClick}
        title={t("main:files.buttons.Open")}
      />
    </>
  );
};
