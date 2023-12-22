import { useUnit } from "effector-react";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import {
  $autoSave,
  $autoSaveDelay,
  AUTO_SAVE_DELAY_MAX,
  AUTO_SAVE_DELAY_MIN,
  AUTO_SAVE_DELAY_STEP,
  setAutoSave,
  setAutoSaveDelay,
} from "models/settings";
import { Checkbox, Field, Range } from "ui/input";

const dd = (i: number) => i.toFixed(0).toString().padStart(2, "0");
const format = (n: number) => {
  const sec = Math.round(n / 1000);
  const min = Math.floor(sec / 60);
  return `${dd(min)}:${dd(sec % 60)} sec`;
};

export const AutoSave: FC = () => {
  const { t } = useTranslation();
  const delay = useUnit($autoSaveDelay);

  return (
    <Field label="Save files">
      <Checkbox checked={useUnit($autoSave)} onChange={setAutoSave}>
        {t("desktop:settings.AutoSaveChangesEvery")}
      </Checkbox>
      <Range
        value={delay}
        onChange={setAutoSaveDelay}
        min={AUTO_SAVE_DELAY_MIN}
        max={AUTO_SAVE_DELAY_MAX}
        step={AUTO_SAVE_DELAY_STEP}
        format={format}
      />
    </Field>
  );
};
