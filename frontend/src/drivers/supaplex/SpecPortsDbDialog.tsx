import {
  ChangeEventHandler,
  createContext,
  forwardRef,
  ReactNode,
  startTransition,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { TileCoords } from "components/settings/display";
import { Trans } from "i18n/Trans";
import { Button, TextButton } from "ui/button";
import { Dialog, renderPrompt, RenderPromptProps } from "ui/feedback";
import { svgs } from "ui/icon";
import { Textarea } from "ui/input";
import { SortableItemProps, SortableList } from "ui/list";
import { ColorType } from "ui/types";
import { ITilesRegion, LevelEditProps } from "../types";
import { InlineTile } from "./InlineTile";
import { ISupaplexSpecPortRecord } from "./internal";
import { isDbEqualToArray, newSpecPortsDatabase } from "./specPortsDb";
import { newSpecPortRecordFromString } from "./specPortsRecord";
import { ISupaplexLevel } from "./types";
import cl from "./SpecPortsDbDialog.module.scss";

interface Options<L extends ISupaplexLevel> extends LevelEditProps<L> {}

export const showSpecPortsDbDialog = <L extends ISupaplexLevel>(
  o: Options<L>,
) => renderPrompt<void>((p) => <SpecPortsDbDialog {...o} {...p} />);

interface Props<L extends ISupaplexLevel>
  extends Options<L>,
    RenderPromptProps<void> {}

const SpecPortsDbDialog = <L extends ISupaplexLevel>({
  show,
  onSubmit,
  onCancel,
  level,
  onChange,
}: Props<L>) => {
  const { t } = useTranslation();
  const [ports, setPorts] = useState<readonly ISupaplexSpecPortRecord[]>(
    Array.from(level.specports.getAll()),
  );
  const isChanged = useMemo(
    () => !isDbEqualToArray(level.specports, ports),
    [ports, level.specports],
  );

  const [isText, setIsText] = useState(false);
  const [text, setText] = useState("");
  const [textError, setTextError] = useState<ReactNode>();
  const hasError = textError !== undefined;
  const handleToggleText = useCallback(
    () =>
      startTransition(() => {
        setIsText((b) => !b);
        setText(isText ? "" : portsToText(ports));
        setTextError(undefined);
      }),
    [isText, ports],
  );
  const handleTextChange = useCallback<ChangeEventHandler<HTMLTextAreaElement>>(
    (e) => {
      const text = e.target.value;
      setText(text);
      const r = portsFromText(text);
      startTransition(() => {
        if (r[0]) {
          setPorts(r[1]);
          setTextError(undefined);
        } else {
          setTextError(r[1]);
        }
      });
    },
    [],
  );

  const handleSave = useCallback(() => {
    onChange(level.setSpecports(newSpecPortsDatabase(ports)));
    onSubmit();
  }, [ports, level, onChange, onSubmit]);

  return (
    <Dialog
      open={show}
      onClose={onCancel}
      title={t("main:supaplex.specportsDB.DialogTitle")}
      buttons={
        <>
          <Button
            uiColor={ColorType.SUCCESS}
            onClick={handleSave}
            disabled={!isChanged || hasError}
          >
            {t("main:common.buttons.OK")}
          </Button>
          <Button onClick={onCancel}>{t("main:common.buttons.Cancel")}</Button>
        </>
      }
      className={cl.dialog}
      bodyClassName={cl.root}
    >
      <p className={cl.info}>
        {isText ? (
          <span>
            <Trans
              i18nKey="main:supaplex.specportsDB.DialogIntroText"
              defaults='All special ports in the level. Both "new line" and <code>&</code> can be used to separate records.'
            />
            <br />
            {textError ? (
              <span className={cl.error}>{textError}</span>
            ) : (
              <span>&nbsp;</span>
            )}
          </span>
        ) : (
          <span>{t("main:supaplex.specportsDB.DialogIntro")}</span>
        )}
        <Button onClick={handleToggleText} disabled={hasError}>
          {isText
            ? t("main:supaplex.specportsDB.BtnToList", "Back to list")
            : t("main:supaplex.specportsDB.BtnToText", "Edit as text")}
        </Button>
      </p>
      <CLevel.Provider value={level}>
        {isText ? (
          <Textarea
            value={text}
            onChange={handleTextChange}
            className={cl.textarea}
          />
        ) : (
          <div
            className={cl.list}
            style={{ "--idx-chars": String(ports.length).length } as {}}
          >
            <SortableList
              items={ports}
              onSort={setPorts}
              idGetter={portKey}
              itemRenderer={Item}
            />
          </div>
        )}
      </CLevel.Provider>
    </Dialog>
  );
};

const portKey = (p: ISupaplexSpecPortRecord) => `${p.x};${p.y}`;

const Item = forwardRef<
  HTMLDivElement,
  SortableItemProps<ISupaplexSpecPortRecord>
>(({ item, itemProps, handleProps, index }, ref) => {
  const level = useContext(CLevel)!;
  // TODO: level.getTileVariant()
  const [[, , , tile, variant]] = level.tilesRenderStream(item.x, item.y, 1, 1);
  return (
    <div ref={ref} {...itemProps} className={cl.item}>
      <span className={cl.index}>{index + 1}.</span>
      <span className={cl.tile}>
        <InlineTile tile={tile} variant={variant} />
      </span>
      <span className={cl.xy}>
        <TileCoords x={item.x} y={item.y} />
      </span>
      <span className={cl.g}>g{item.gravity}</span>
      <span className={cl.z}>z{item.freezeZonks}</span>
      <span className={cl.e}>e{item.freezeEnemies}</span>
      <span className={cl.u}>u{item.unusedByte}</span>
      {/* TODO: <span>{item.isStdCompatible(width) && 'STD'}</span>*/}
      <TextButton
        icon={<svgs.DragV />}
        {...handleProps}
        className={cl.handle}
      />
    </div>
  );
});

const CLevel = createContext<ITilesRegion | null>(null);

// ----------------------

const portsToText = (ports: readonly ISupaplexSpecPortRecord[]): string =>
  ports.map((p) => p.toString({ withZeros: true }) + "\n").join("");

type PortsFromTextResult =
  | readonly [valid: true, ports: readonly ISupaplexSpecPortRecord[]]
  | readonly [valid: false, error: ReactNode];

const portsFromText = (text: string): PortsFromTextResult => {
  const ports: ISupaplexSpecPortRecord[] = [];
  for (let line of text.split(/[\n\r&]+/)) {
    line = line.trim();
    if (line) {
      ports.push(newSpecPortRecordFromString(line.trim()));
    }
  }
  return [true, ports];
};
