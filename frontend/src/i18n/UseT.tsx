import { FC } from "react";
import { useTranslation } from "react-i18next";
import { TranslationGetter } from "./types";

interface Props {
  get: TranslationGetter;
}

export const UseT: FC<Props> = ({ get }) => {
  const { t } = useTranslation();
  return <>{get(t)}</>;
};
