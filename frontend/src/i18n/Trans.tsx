import { FC } from "react";
import { Trans as OrigTrans, TransProps, useTranslation } from "react-i18next";
import { APP_TITLE, TEST_LEVEL_URL, VERSION_URL } from "configs";
import i18next from "i18next";
import { constElement } from "utils/react";

const components = {
  sple: constElement(<strong>{APP_TITLE}</strong>),
  spleMe: constElement(<strong>sple.me</strong>),
  spleDesktop: constElement(
    <strong>
      {i18next.t("main:app.DesktopName", "Desktop {APP_TITLE}", { APP_TITLE })}
    </strong>,
  ),
  linkSpleMe: constElement(
    <a href="https://sple.me" target="_blank" rel="noopener noreferrer">
      sple.me
    </a>,
  ),
  linkVer: <a href={VERSION_URL} target="_blank" rel="noopener noreferrer" />,
  linkSo: (
    <a
      href="https://www.supaplex.online/"
      target="_blank"
      rel="noopener noreferrer"
    />
  ),
  linkSoTest: (
    <a href={TEST_LEVEL_URL} target="_blank" rel="noopener noreferrer" />
  ),
  b: <strong />,
  br: <br />,
  code: <code />,
  i: <em />,
  em: <em />,
  kbd: <kbd />,
};

// https://github.com/i18next/i18next-parser#jsx

export const Trans: FC<
  Pick<
    TransProps<string>,
    "i18nKey" | "components" | "defaults" | "values" | "children"
  >
> = (p) => {
  const { t } = useTranslation();
  return (
    <OrigTrans
      t={t}
      {...p}
      components={
        p.components ? { ...components, ...p.components } : components
      }
    />
  );
};
