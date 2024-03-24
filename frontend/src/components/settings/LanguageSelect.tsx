import { useUnit } from "effector-react";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import defaultLang, { locales } from "i18n/locales";
import { $language, setLanguage } from "models/settings";
import { Field, Select, SelectOption } from "ui/input";

interface LangRes {
  readonly $language?: {
    // t('main:$language.name')
    readonly name?: string;
  };
}
const options = Object.entries(locales).map<SelectOption<string>>(([k, v]) => {
  const { name } = (v.main as LangRes).$language || {};
  return {
    value: k,
    label: `${k}${name ? `: ${name}` : ""}`,
  };
});

const handleChange = (o: SelectOption<string> | null) => {
  setLanguage(o ? o.value : defaultLang);
};

export const LanguageSelect: FC = () => {
  const { t } = useTranslation();
  const lang = useUnit($language);

  return (
    <Field label={t("main:settings.Language")}>
      <Select
        options={options}
        value={options.find((o) => o.value === lang)}
        onChange={handleChange}
      />
    </Field>
  );
};
