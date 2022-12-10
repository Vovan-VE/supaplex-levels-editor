import {
  ChangeEventHandler,
  FC,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  canResize,
  canResizeHeight,
  canResizeWidth,
  DISPLAY_ORDER,
  DriverName,
  getDriver,
  getDriverFormat,
  parseFormatFilename,
} from "drivers";
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
import { minmax } from "utils/number";
import { strCmp } from "utils/strings";
import cl from "./NewFile.module.scss";

export const promptNewFile = () =>
  renderPrompt((props) => <NewFile {...props} />);

const driversOptions = DISPLAY_ORDER.map<SelectOption<DriverName>>((value) => ({
  value,
  label: getDriver(value).title,
}));

interface FormatOption extends SelectOption<string> {
  _default?: boolean;
}

const formatOptions = new Map<DriverName, readonly FormatOption[]>(
  DISPLAY_ORDER.map((d) => {
    const driver = getDriver(d);
    return [
      d,
      Object.entries(driver.formats)
        .map<FormatOption>(([value, f]) => ({
          value,
          label: f.title,
          _default: driver.defaultFormat === value,
        }))
        .sort((a, b) => strCmp(a.label, b.label)),
    ];
  }),
);

const getDefaultFormat = (o: readonly FormatOption[]) =>
  o.find((o) => o._default) || o[0];

interface Props extends RenderPromptProps<true> {}

const NewFile: FC<Props> = ({ show, onSubmit, onCancel }) => {
  const [driverName, setDriverName] = useState<DriverName>(DISPLAY_ORDER[0]);
  const curFormatsOptions = formatOptions.get(driverName)!;
  const [driverFormat, setDriverFormat] = useState(
    getDefaultFormat(curFormatsOptions).value,
  );
  useEffect(
    () => setDriverFormat(getDefaultFormat(curFormatsOptions).value),
    [curFormatsOptions],
  );

  const [filename, setFilename] = useState("new");
  const [levelsCount, setLevelsCount] = useState<number | null>(111);
  const [title, setTitle] = useState("EMPTY");
  const [width, setWidth] = useState<number | null>(null);
  const [height, setHeight] = useState<number | null>(null);

  const format = getDriverFormat(driverName, driverFormat)!;
  const { resizable, minLevelsCount, maxLevelsCount } = format;
  useEffect(
    () =>
      setLevelsCount((n) =>
        n === null
          ? null
          : minmax(
              n,
              minLevelsCount,
              maxLevelsCount ?? Number.MAX_SAFE_INTEGER,
            ),
      ),
    [minLevelsCount, maxLevelsCount],
  );
  const level = useMemo(() => format.createLevel(), [format]);
  const { maxTitleLength, width: defaultWidth, height: defaultHeight } = level;

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
  const handleFormatChange = useCallback((o: FormatOption | null) => {
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

  const fileExt = parseFormatFilename(filename, driverName, driverFormat);

  const handleOk = useCallback(async () => {
    if ((fileExt.hasExt && !fileExt.isExtValid) || levelsCount === null) {
      return;
    }
    const format = getDriverFormat(driverName as string, driverFormat)!;
    const { resizable } = format;
    if (canResize(resizable) && (width !== null || height !== null)) {
      const { minWidth = 1, minHeight = 1, maxWidth, maxHeight } = resizable;
      if (
        width !== null &&
        (width < minWidth || (maxWidth !== undefined && width > maxWidth))
      ) {
        return;
      }
      if (
        height !== null &&
        (height < minHeight || (maxHeight !== undefined && height > maxHeight))
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
      levelsCount < format.minLevelsCount ||
      (format.maxLevelsCount !== null && levelsCount > format.maxLevelsCount)
    ) {
      return;
    }

    const levels = Array.from({ length: levelsCount }).map(() => level);

    let newFilename = filename;
    if (!fileExt.hasExt) {
      newFilename += "." + format.fileExtensionDefault;
    }

    try {
      await addLevelsetFileFx({
        file: new Blob([format.writeLevelset(format.createLevelset(levels))]),
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

  const isResizableW = canResizeWidth(resizable);
  const isResizableH = canResizeHeight(resizable);

  return (
    <Dialog
      title="New file"
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
        <Field label="Driver">
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
                Default extension <code>{format.fileExtensionDefault}</code>{" "}
                will be appended.
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
          className={cl.long}
        >
          <Input
            value={title}
            onChange={handleTitleChange}
            maxLength={maxTitleLength}
            className={cl.title}
          />
        </Field>

        {(isResizableW || isResizableH) && (
          <>
            <Field
              label="Levels Width"
              error={
                isResizableW &&
                width !== null &&
                intRangeError(
                  width,
                  resizable.minWidth ?? 1,
                  resizable.maxWidth,
                )
              }
            >
              {isResizableW ? (
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
                isResizableH &&
                height !== null &&
                intRangeError(
                  height,
                  resizable.minHeight ?? 1,
                  resizable.maxHeight,
                )
              }
            >
              {isResizableH ? (
                <IntegerInput
                  value={height}
                  onChange={setHeight}
                  placeholder={String(defaultHeight)}
                />
              ) : (
                <IntegerInput value={defaultHeight} readOnly disabled />
              )}
            </Field>

            {width !== null && height !== null && (
              <NoticeSizeLags totalTiles={width * height} className={cl.long} />
            )}
          </>
        )}

        {/* TODO: prompt dialog: driver & its options */}
      </div>
    </Dialog>
  );
};
