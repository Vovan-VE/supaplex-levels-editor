import { FC } from "react";
import { useTranslation } from "react-i18next";
import { getClipboardText } from "backend";
import { detectDriverFormat } from "drivers";
import { Trans } from "i18n/Trans";
import { importLevelAsLink } from "models/levels/import-url";
import { addLevelsetFileFx } from "models/levelsets";
import { showToast, showToastError } from "models/ui/toasts";
import { Button } from "ui/button";
import { IconStackType, svgs } from "ui/icon";
import { ColorType } from "ui/types";
import { handleOpenClick } from "./handleOpenClick";
import { promptNewFile } from "./promptNewFile";

const handleOpenTestLink = async () => {
  try {
    let text = await getClipboardText();
    text = text?.trim();
    if (!text) {
      showToast({
        message: <Trans i18nKey="main:levels.import.NoTextInClipboard" />,
        color: ColorType.WARN,
      });
      return;
    }
    const file = await importLevelAsLink(text);
    const whatIsThat = detectDriverFormat(await file.arrayBuffer(), file.name);
    const [driverName, driverFormat] = whatIsThat!;
    await addLevelsetFileFx({
      file,
      driverName,
      driverFormat,
      name: file.name,
    });
  } catch (e) {
    showToastError(e);
  }
};

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
      <Button
        icon={<svgs.DirOpen />}
        iconStack={[[IconStackType.Index, <svgs.LinkTest />]]}
        onClick={handleOpenTestLink}
        title={t("main:files.buttons.OpenTestLink")}
      />
    </>
  );
};
