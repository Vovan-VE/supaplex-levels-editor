import { useStore } from "effector-react";
import {
  FC,
  FormEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { getDriver } from "drivers";
import { $currentLevelsetFile } from "models/levelsets";
import { Button } from "ui/button";
import { Field, Select, SelectOption } from "ui/input";
import { Dialog, renderPrompt, RenderPromptProps } from "ui/feedback";
import { ColorType } from "ui/types";
import { strCmp } from "utils/strings";
import cl from "./promptFormat.module.scss";

export const promptFormat = () =>
  renderPrompt<string>((props) => <SelectFormat {...props} />);

interface Props extends RenderPromptProps<string> {}

const SelectFormat: FC<Props> = ({ show, onSubmit, onCancel }) => {
  const { t } = useTranslation();
  const file = useStore($currentLevelsetFile);
  useEffect(() => {
    if (!file) {
      onCancel();
    }
  }, [file, onCancel]);

  const driver = file && getDriver(file.driverName);
  const { formats } = driver || {};
  const formatOptions = useMemo(
    () =>
      formats &&
      Object.entries(formats)
        .map<SelectOption<string>>(([value, f]) => ({
          value,
          label: f.title,
        }))
        .sort((a, b) => strCmp(a.label!, b.label!)),
    [formats],
  );

  const [newFormat, setNewFormat] = useState(file?.driverFormat ?? null);
  const handleFormatChange = useCallback(
    (o: SelectOption<string> | null) => setNewFormat(o ? o.value : null),
    [],
  );
  const handleOk = useCallback<FormEventHandler>(
    (e) => {
      e.preventDefault();
      if (file && newFormat !== null && newFormat !== file.driverFormat) {
        onSubmit(newFormat);
      }
    },
    [newFormat, file, onSubmit],
  );

  if (!file) {
    return null;
  }
  return (
    <Dialog
      title={t("main:files.convert.DialogTitle")}
      size="small"
      open={show}
      wrapForm={{ onSubmit: handleOk }}
      buttons={
        <>
          <Button
            uiColor={ColorType.SUCCESS}
            type="submit"
            disabled={!newFormat || newFormat === file.driverFormat}
          >
            {t("main:common.buttons.OK")}
          </Button>
          <Button type="button" onClick={onCancel}>
            {t("main:common.buttons.Cancel")}
          </Button>
        </>
      }
      onClose={onCancel}
    >
      <Field label={t("main:files.convert.FileFormat")} className={cl.root}>
        <Select
          options={formatOptions || []}
          value={formatOptions?.find((o) => o.value === newFormat) ?? null}
          onChange={handleFormatChange}
        />
      </Field>
    </Dialog>
  );
};
