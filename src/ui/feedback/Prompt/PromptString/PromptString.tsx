import {
  ChangeEvent,
  FC,
  FormEvent,
  InputHTMLAttributes,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from "react";
import { Button } from "ui/button";
import { Field, Input } from "ui/input";
import { ColorType } from "ui/types";
import { Dialog } from "../../Dialog";
import { renderPrompt, RenderPromptProps } from "../renderPrompt";

// import cl from "./PromptString.module.scss";

export interface PromptStringOptions
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    | "title"
    | "value"
    | "onChange"
    | "disabled"
    | "readOnly"
    | "onSubmit"
    | "children"
  > {
  /** Prompt dialog title. Default: absent. */
  title?: ReactNode;
  /** Label above input. Default: absent. */
  label?: ReactNode;

  /** Default value in input. */
  defaultValue?: string;
  /** Whether to perform `trim()` before validation. Default: `true`. */
  trim?: boolean;
  /** Extra filter after `trim()` before validation. For example, case conversion. */
  filter?: (input: string) => string;
  /** Alternative check whether the value is empty after filters. Used only in case of `required`. */
  isEmpty?: (value: string) => boolean;
  /** Extra validation after optional `required`. */
  validate?: (value: string) => { error: ReactNode } | null;
}

interface Props extends PromptStringOptions, RenderPromptProps<string> {}

const isEmptyString = (s: string) => !s.length;

export const PromptString: FC<Props> = ({
  title,
  label,

  defaultValue = "",
  trim = true,
  filter,
  isEmpty = isEmptyString,
  validate,

  show,
  onSubmit,
  onCancel,

  ...rest
}) => {
  const { required = false } = rest;

  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState<ReactNode>();
  const handleInputChange = useCallback(
    ({ target: { value } }: ChangeEvent<HTMLInputElement>) => setValue(value),
    [],
  );

  const realFilter = useCallback(
    (value: string) => {
      if (trim) {
        value = value.trim();
      }
      if (filter) {
        value = filter(value);
      }
      return value;
    },
    [trim, filter],
  );

  const handleOk = useCallback(() => {
    const actualValue = realFilter(value);
    setValue(actualValue);
    if (required && isEmpty(actualValue)) {
      setError("This field is required.");
      return;
    }
    const err = validate?.(actualValue);
    if (err) {
      setError(err.error ?? "Invalid value.");
      return;
    }
    setError(undefined);
    onSubmit(actualValue);
  }, [value, realFilter, required, isEmpty, validate, onSubmit]);

  return (
    <Dialog
      title={title}
      open={show}
      wrapForm={useMemo(
        () => ({
          onSubmit: (e: FormEvent) => {
            e.preventDefault();
            handleOk();
          },
        }),
        [handleOk],
      )}
      buttons={
        <>
          <Button uiColor={ColorType.SUCCESS} type="submit">
            OK
          </Button>
          <Button type="button" onClick={onCancel}>
            Cancel
          </Button>
        </>
      }
      onClose={onCancel}
    >
      <Field label={label} error={error}>
        <Input autoFocus {...rest} value={value} onChange={handleInputChange} />
      </Field>
    </Dialog>
  );
};

export const promptString = (options?: PromptStringOptions) =>
  renderPrompt<string>((props) => <PromptString {...props} {...options} />);
