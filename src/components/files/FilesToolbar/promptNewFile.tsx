import {
  ChangeEventHandler,
  FC,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { DISPLAY_ORDER, DriverName, getDriver, getDriverFormat } from "drivers";
import { addLevelsetFileFx } from "models/levelsets";
import { NoticeSizeLags } from "../../level/toolbars/LevelConfig/NoticeSizeLags";
import { Button } from "ui/button";
import {
  Dialog,
  intRangeError,
  msgBox,
  renderPrompt,
  RenderPromptProps,
} from "ui/feedback";
import { Field, Input, IntegerInput, Select, SelectOption } from "ui/input";
import { ColorType } from "ui/types";
import cl from "./NewFile.module.scss";

export const promptNewFile = () =>
  renderPrompt((props) => <NewFile {...props} />);

const driversOptions = DISPLAY_ORDER.map<SelectOption<DriverName>>((value) => ({
  value,
  label: getDriver(value).title,
}));
const formatOptions = new Map<DriverName, readonly SelectOption<string>[]>(
  DISPLAY_ORDER.map((d) => [
    d,
    Object.entries(getDriver(d).formats).map(([value, f]) => ({
      value,
      label: f.title,
    })),
  ]),
);

interface Props extends RenderPromptProps<true> {}

const NewFile: FC<Props> = ({ show, onSubmit, onCancel }) => {
  const [driverName, setDriverName] = useState<DriverName>(DISPLAY_ORDER[0]);
  const [driverFormat, setDriverFormat] = useState(
    formatOptions.get(DISPLAY_ORDER[0])![0].value,
  );
  const curFormatsOptions = formatOptions.get(driverName)!;
  useEffect(
    () => setDriverFormat(curFormatsOptions[0].value),
    [curFormatsOptions],
  );

  const [filename, setFilename] = useState("new-levelset");
  const [levelsCount, setLevelsCount] = useState<number | null>(111);
  const [title, setTitle] = useState("EMPTY");
  const [width, setWidth] = useState<number | null>(null);
  const [height, setHeight] = useState<number | null>(null);

  const {
    level,
    level: { maxTitleLength, width: defaultWidth, height: defaultHeight },
    resizable,
    fileExtensionDefault,
    minLevelsCount,
    maxLevelsCount,
  } = useMemo(() => {
    const format = getDriverFormat(driverName, driverFormat)!;
    const { fileExtensionDefault, resizable, minLevelsCount, maxLevelsCount } =
      format;
    const level = format.createLevel();
    return {
      level,
      resizable,
      fileExtensionDefault,
      minLevelsCount,
      maxLevelsCount,
    };
  }, [driverName, driverFormat]);
  const titleError = useMemo(() => {
    try {
      level.setTitle(title);
      return null;
    } catch (e) {
      return e instanceof Error ? e.message : "unknown error";
    }
  }, [level, title]);

  const handleDriverChange = useCallback(
    (o: SelectOption<DriverName> | null) => {
      if (o) {
        setDriverName(o.value);
      }
    },
    [],
  );
  const handleFormatChange = useCallback((o: SelectOption<string> | null) => {
    if (o) {
      setDriverFormat(o.value);
    }
  }, []);
  const handleFilenameChange = useCallback<
    ChangeEventHandler<HTMLInputElement>
  >(({ target: { value } }) => setFilename(value), []);
  const handleTitleChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    ({ target: { value } }) => setTitle(value),
    [],
  );

  const fileExt = parseFilename(filename, driverName, driverFormat);

  const handleOk = useCallback(async () => {
    if ((fileExt.hasExt && !fileExt.isExtValid) || levelsCount === null) {
      return;
    }
    const format = getDriverFormat(driverName as string, driverFormat)!;
    const {
      fileExtensionDefault,
      writeLevelset,
      resizable,
      minLevelsCount,
      maxLevelsCount,
    } = format;

    if (resizable && (width !== null || height !== null)) {
      if (
        width !== null &&
        ((resizable.minWidth !== undefined && width < resizable.minWidth) ||
          (resizable.maxWidth !== undefined && width > resizable.maxWidth))
      ) {
        return;
      }
      if (
        height !== null &&
        ((resizable.minHeight !== undefined && height < resizable.minHeight) ||
          (resizable.maxHeight !== undefined && height > resizable.maxHeight))
      ) {
        return;
      }
    }

    let level = format.createLevel({
      width: width ?? undefined,
      height: height ?? undefined,
      // TODO: `borderTile` can be configured too
    });
    try {
      level = level.setTitle(title);
    } catch {
      return;
    }

    if (
      levelsCount < minLevelsCount ||
      (maxLevelsCount !== null && levelsCount > maxLevelsCount)
    ) {
      return;
    }

    const levels = Array.from({ length: levelsCount }).map(() => level);

    let newFilename = filename;
    if (!fileExt.hasExt) {
      newFilename += "." + fileExtensionDefault;
    }

    try {
      await addLevelsetFileFx({
        file: new Blob([writeLevelset(format.createLevelset(levels))]),
        driverName,
        driverFormat,
        name: newFilename,
      });
      onSubmit(true);
    } catch (e) {
      msgBox(
        <>
          Could not create levelset:{" "}
          {e instanceof Error ? e.message : "unknown error"}
        </>,
      );
    }
  }, [
    driverName,
    driverFormat,
    filename,
    fileExt.hasExt,
    fileExt.isExtValid,
    levelsCount,
    title,
    width,
    height,
    onSubmit,
  ]);

  return (
    <Dialog
      title="New file"
      size="small"
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
      <div className={cl.root}>
        <Field label="Driver*">
          <Select
            options={driversOptions}
            value={driversOptions.find((o) => o.value === driverName) ?? null}
            onChange={handleDriverChange}
          />
        </Field>
        <Field label="File type">
          <Select
            options={curFormatsOptions}
            value={
              curFormatsOptions.find((o) => o.value === driverFormat) ?? null
            }
            onChange={handleFormatChange}
          />
        </Field>
        <Field
          label="File name"
          help={
            !fileExt.hasExt && (
              <>
                Default extension <code>{fileExtensionDefault}</code> will be
                appended.
              </>
            )
          }
          error={
            fileExt.hasExt && !fileExt.isExtValid && "Invalid file extension."
          }
        >
          <Input value={filename} onChange={handleFilenameChange} />
        </Field>
        <Field
          label="Levels count"
          error={intRangeError(levelsCount, minLevelsCount, maxLevelsCount)}
        >
          <IntegerInput
            value={levelsCount}
            onChange={setLevelsCount}
            required
          />
        </Field>
        <Field
          label="Title for every level"
          error={
            title.length > maxTitleLength
              ? `Up to ${maxTitleLength} characters`
              : titleError && `Invalid value: ${titleError}`
          }
        >
          <Input
            value={title}
            onChange={handleTitleChange}
            maxLength={maxTitleLength}
            className={cl.title}
          />
        </Field>

        <Field
          label="Levels Width"
          error={
            resizable &&
            width !== null &&
            intRangeError(width, resizable.minWidth ?? 1, resizable.maxWidth)
          }
        >
          {resizable ? (
            <IntegerInput
              value={width}
              onChange={setWidth}
              placeholder={String(defaultWidth)}
            />
          ) : (
            <IntegerInput value={defaultWidth} readOnly disabled />
          )}
        </Field>
        <Field
          label="Levels Height"
          error={
            resizable &&
            height !== null &&
            intRangeError(height, resizable.minHeight ?? 1, resizable.maxHeight)
          }
        >
          {resizable ? (
            <IntegerInput
              value={height}
              onChange={setHeight}
              placeholder={String(defaultHeight)}
            />
          ) : (
            <IntegerInput value={defaultHeight} readOnly disabled />
          )}
        </Field>

        {resizable && width !== null && height !== null && (
          <NoticeSizeLags totalTiles={width * height} />
        )}

        {/* TODO: prompt dialog: driver & its options */}
      </div>
    </Dialog>
  );
};

interface _FN {
  hasExt: boolean;
  isExtValid: boolean;
}
const parseFilename = (
  filename: string,
  driverName: DriverName,
  driverFormat: string,
): _FN => {
  const ext = filename.match(/.\.([^.]*)$/)?.[1];
  if (ext === undefined) {
    return { hasExt: false, isExtValid: false };
  }

  const { fileExtensionDefault, fileExtensions } = getDriverFormat(
    driverName,
    driverFormat,
  );

  return {
    hasExt: true,
    isExtValid: fileExtensions
      ? new RegExp(`^${fileExtensions.source}$`, "i").test(ext)
      : ext.toLowerCase() === fileExtensionDefault.toLowerCase(),
  };
};
