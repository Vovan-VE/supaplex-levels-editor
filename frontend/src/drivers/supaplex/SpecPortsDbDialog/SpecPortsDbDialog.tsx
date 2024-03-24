import {
  ChangeEventHandler,
  ReactNode,
  startTransition,
  useCallback,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { Trans } from "i18n/Trans";
import { Button } from "ui/button";
import { Dialog, RenderPromptProps } from "ui/feedback";
import { Textarea } from "ui/input";
import { SortableList } from "ui/list";
import { ColorType } from "ui/types";
import { LevelEditProps } from "../../types";
import { ISupaplexSpecPortRecord } from "../internal";
import { isDbEqualToArray, newSpecPortsDatabase } from "../specPortsDb";
import { newSpecPortRecordFromString } from "../specPortsRecord";
import { ISupaplexLevel } from "../types";
import { CLevel } from "./context";
import { Item } from "./Item";
import cl from "./SpecPortsDbDialog.module.scss";

interface Options<L extends ISupaplexLevel> extends LevelEditProps<L> {}

interface Props<L extends ISupaplexLevel>
  extends Options<L>,
    RenderPromptProps<void> {}

export const SpecPortsDbDialog = <L extends ISupaplexLevel>({
  show,
  onSubmit,
  onCancel,
  level,
  onChange,
}: Props<L>) => {
  const { t } = useTranslation();
  const isRO = !onChange;
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

  const handleSave = useMemo(
    () =>
      onChange &&
      (() => {
        onChange(level.setSpecports(newSpecPortsDatabase(ports)));
        onSubmit();
      }),
    [ports, level, onChange, onSubmit],
  );

  return (
    <Dialog
      open={show}
      onClose={onCancel}
      title={t("main:supaplex.specportsDB.DialogTitle")}
      buttons={
        <>
          {isRO || (
            <Button
              uiColor={ColorType.SUCCESS}
              onClick={handleSave}
              disabled={!isChanged || hasError}
            >
              {t("main:common.buttons.OK")}
            </Button>
          )}
          <Button onClick={onCancel}>{t("main:common.buttons.Cancel")}</Button>
        </>
      }
      className={cl.dialog}
      bodyClassName={cl.root}
    >
      <p className={cl.info}>
        {isText ? (
          <span>
            <Trans i18nKey="main:supaplex.specportsDB.DialogIntroText" />
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
            ? t("main:supaplex.specportsDB.BtnToList")
            : t("main:supaplex.specportsDB.BtnToText")}
        </Button>
      </p>
      <CLevel.Provider value={level}>
        {isText ? (
          <Textarea
            value={text}
            onChange={handleTextChange}
            className={cl.textarea}
            readOnly={isRO}
          />
        ) : (
          <div
            className={cl.list}
            style={{ "--idx-chars": String(ports.length).length } as object}
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
