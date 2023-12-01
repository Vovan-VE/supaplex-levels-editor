import {
  ChangeEventHandler,
  FC,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { NoticeSizeLags } from "components/level/toolbars/LevelConfig";
import { TileSelect } from "components/driver/TileSelect";
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
import { TILE_HARDWARE } from "drivers/supaplex/tiles-id";
import { Trans } from "i18n/Trans";
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
        .sort((a, b) => strCmp(a.label!, b.label!)),
    ];
  }),
);

const getDefaultFormat = (o: readonly FormatOption[]) =>
  o.find((o) => o._default) || o[0];

interface Props extends RenderPromptProps<true> {}

const NewFile: FC<Props> = ({ show, onSubmit, onCancel }) => {
  const { t } = useTranslation();

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
  // TODO: define defaults in driver
  const [borderTile, setBorderTile] = useState(TILE_HARDWARE);
  const [fillTile, setFillTile] = useState(0);

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
      borderTile,
      fillTile,
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
        <Trans
          i18nKey="main:files.messages.CannotCreateNew"
          values={{ reason: e instanceof Error ? e.message : "unknown error" }}
        />,
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
    borderTile,
    fillTile,
    onSubmit,
  ]);

  const isResizableW = canResizeWidth(resizable);
  const isResizableH = canResizeHeight(resizable);

  return (
    <Dialog
      title={t("main:files.new.DialogTitle")}
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
            {t("main:common.buttons.OK")}
          </Button>
          <Button type="button" onClick={onCancel}>
            {t("main:common.buttons.Cancel")}
          </Button>
        </>
      }
      onClose={onCancel}
    >
      <div className={cl.root}>
        <Field label={t("main:files.new.Driver")}>
          <Select
            options={driversOptions}
            value={driversOptions.find((o) => o.value === driverName) ?? null}
            onChange={handleDriverChange}
          />
        </Field>
        <Field label={t("main:files.new.FileFormat")}>
          <Select
            options={curFormatsOptions}
            value={
              curFormatsOptions.find((o) => o.value === driverFormat) ?? null
            }
            onChange={handleFormatChange}
          />
        </Field>
        <Field
          label={t("main:files.new.FileName")}
          help={
            fileExt.hasExt ? null : (
              <Trans
                i18nKey="main:files.new.DefaultFileExt"
                values={{ ext: format.fileExtensionDefault }}
              />
            )
          }
          error={
            fileExt.hasExt &&
            !fileExt.isExtValid &&
            t("main:files.new.InvalidFileExt")
          }
        >
          <Input value={filename} onChange={handleFilenameChange} />
        </Field>
        <Field
          label={t("main:files.new.LevelsCount")}
          error={intRangeError(levelsCount, minLevelsCount, maxLevelsCount)}
        >
          <IntegerInput
            value={levelsCount}
            onChange={setLevelsCount}
            required
          />
        </Field>
        <Field
          label={t("main:files.new.LevelTitle")}
          error={
            title.length > maxTitleLength
              ? t("main:validate.StrMaxLen", { max: maxTitleLength })
              : titleError &&
                t("main:validate.InvalidValue", { error: titleError })
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
              label={t("main:files.new.LevelWidth")}
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
              label={t("main:files.new.LevelHeight")}
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

        <Field label={t("main:files.new.Border")}>
          <TileSelect
            driverName={driverName}
            tile={borderTile}
            onChange={setBorderTile}
          />
        </Field>
        <Field label={t("main:files.new.FillBody")}>
          <TileSelect
            driverName={driverName}
            tile={fillTile}
            onChange={setFillTile}
          />
        </Field>

        {/* TODO: prompt dialog: driver & its options */}
      </div>
    </Dialog>
  );
};
