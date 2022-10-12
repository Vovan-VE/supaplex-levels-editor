import {
  ChangeEventHandler,
  FC,
  FormEvent,
  useCallback,
  useMemo,
  useState,
} from "react";
import { DISPLAY_ORDER, DriverName, getDriver } from "drivers";
import { addLevelsetFileFx } from "models/levelsets";
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

interface Props extends RenderPromptProps<true> {}

const NewFile: FC<Props> = ({ show, onSubmit, onCancel }) => {
  const [driverName, setDriverName] = useState<DriverName>(DISPLAY_ORDER[0]);
  const [filename, setFilename] = useState("new-levelset");
  const [levelsCount, setLevelsCount] = useState<number | null>(111);
  const [title, setTitle] = useState("EMPTY");
  const [width, setWidth] = useState<number | null>(null);
  const [height, setHeight] = useState<number | null>(null);

  const {
    level,
    level: {
      resizable,
      maxTitleLength,
      width: defaultWidth,
      height: defaultHeight,
    },
    fileExtensionDefault,
    minLevelsCount,
    maxLevelsCount,
  } = useMemo(() => {
    const drv = getDriver(driverName as string)!;
    const { fileExtensionDefault } = drv;
    const level = drv.createLevel();
    const { minLevelsCount, maxLevelsCount } = drv.createLevelset([level]);
    return {
      level,
      fileExtensionDefault,
      minLevelsCount,
      maxLevelsCount,
    };
  }, [driverName]);
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
  const handleFilenameChange = useCallback<
    ChangeEventHandler<HTMLInputElement>
  >(({ target: { value } }) => setFilename(value), []);
  const handleTitleChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    ({ target: { value } }) => setTitle(value),
    [],
  );

  const fileExt = parseFilename(filename, driverName);

  const handleOk = useCallback(async () => {
    if ((fileExt.hasExt && !fileExt.isExtValid) || levelsCount === null) {
      return;
    }
    const drv = getDriver(driverName as string)!;
    const { fileExtensionDefault, writer } = drv;
    if (!writer) {
      return;
    }

    let level = drv.createLevel();
    if (title.length > level.maxTitleLength) {
      return;
    }
    try {
      level = level.setTitle(title);
    } catch {
      return;
    }
    const { resizable } = level;
    if (resizable && level.resize && (width !== null || height !== null)) {
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
      // FIXME: level border
      level = level.resize(width ?? level.width, height ?? level.height);
    }

    const levelset = drv.createLevelset([level]);
    if (
      levelsCount < levelset.minLevelsCount ||
      (levelset.maxLevelsCount !== null &&
        levelsCount > levelset.maxLevelsCount)
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
        file: new Blob([writer.writeLevelset(drv.createLevelset(levels))]),
        driverName,
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
        <Field label="File type">
          <Select
            options={driversOptions}
            value={driversOptions.find((o) => o.value === driverName) ?? null}
            onChange={handleDriverChange}
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

        {/* TODO: notice about possible lags due to level size or levels count */}

        {/* TODO: prompt dialog: driver & its options */}
      </div>
    </Dialog>
  );
};

interface _FN {
  hasExt: boolean;
  isExtValid: boolean;
}
const parseFilename = (filename: string, driverName: DriverName): _FN => {
  const ext = filename.match(/.\.([^.]*)$/)?.[1];
  if (ext === undefined) {
    return { hasExt: false, isExtValid: false };
  }

  const { fileExtensionDefault, fileExtensions } = getDriver(driverName);

  return {
    hasExt: true,
    isExtValid: fileExtensions
      ? new RegExp(`^${fileExtensions.source}$`, "i").test(ext)
      : ext.toLowerCase() === fileExtensionDefault.toLowerCase(),
  };
};
