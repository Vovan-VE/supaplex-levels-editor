import { useStore } from "effector-react";
import {
  FC,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
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
        .sort((a, b) => strCmp(a.label, b.label)),
    [formats],
  );

  const [newFormat, setNewFormat] = useState(file?.driverFormat ?? null);
  const handleFormatChange = useCallback(
    (o: SelectOption<string> | null) => setNewFormat(o ? o.value : null),
    [],
  );
  const handleOk = useCallback(() => {
    if (file && newFormat !== null && newFormat !== file.driverFormat) {
      onSubmit(newFormat);
    }
  }, [newFormat, file, onSubmit]);

  if (!file) {
    return null;
  }
  return (
    <Dialog
      title="Convert file format"
      size="small"
      open={show}
      wrapForm={{
        onSubmit: (e: FormEvent) => {
          e.preventDefault();
          handleOk();
        },
      }}
      buttons={
        <>
          <Button
            uiColor={ColorType.SUCCESS}
            type="submit"
            disabled={!newFormat || newFormat === file.driverFormat}
          >
            OK
          </Button>
          <Button type="button" onClick={onCancel}>
            Cancel
          </Button>
        </>
      }
      onClose={onCancel}
    >
      <Field label="File type" className={cl.root}>
        <Select
          options={formatOptions || []}
          value={formatOptions?.find((o) => o.value === newFormat) ?? null}
          onChange={handleFormatChange}
        />
      </Field>
    </Dialog>
  );
};
