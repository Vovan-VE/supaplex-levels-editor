import { forwardRef, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { TileCoords } from "components/settings/display";
import { Button, TextButton } from "ui/button";
import { Dialog, renderPrompt, RenderPromptProps } from "ui/feedback";
import { svgs } from "ui/icon";
import { SortableItemProps, SortableList } from "ui/list";
import { ColorType } from "ui/types";
import { LevelEditProps } from "../types";
import { ISupaplexSpecPortRecord } from "./internal";
import { isDbEqualToArray, newSpecPortsDatabase } from "./specPortsDb";
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

  const handleSave = useCallback(() => {
    onChange(level.setSpecports(newSpecPortsDatabase(ports)));
    onSubmit();
  }, [ports, level, onChange, onSubmit]);

  return (
    <Dialog
      open={show}
      onClose={onCancel}
      title={t(
        "main:supaplex.specportsDB.DialogTitle",
        "Special Ports Database",
      )}
      buttons={
        <>
          <Button
            uiColor={ColorType.SUCCESS}
            onClick={handleSave}
            disabled={!isChanged}
          >
            {t("main:common.buttons.OK")}
          </Button>
          <Button onClick={onCancel}>{t("main:common.buttons.Cancel")}</Button>
        </>
      }
      bodyClassName={cl.root}
    >
      <p>
        {t(
          "main:supaplex.specportsDB.DialogIntro",
          "All special ports in the level. Drag to sort.",
        )}
      </p>
      <div className={cl.list}>
        <SortableList
          items={ports}
          onSort={setPorts}
          idGetter={portKey}
          itemRenderer={Item}
        />
      </div>
    </Dialog>
  );
};

const portKey = (p: ISupaplexSpecPortRecord) => `${p.x};${p.y}`;

const Item = forwardRef<
  HTMLDivElement,
  SortableItemProps<ISupaplexSpecPortRecord>
>(({ item, itemProps, handleProps, index }, ref) => (
  <div ref={ref} {...itemProps} className={cl.item}>
    <span className={cl.index}>{index + 1}.</span>
    <span className={cl.xy}>
      <TileCoords x={item.x} y={item.y} />
    </span>
    {/* TODO: <span><InlineTile tile={tile} /></span>*/}
    <span className={cl.g}>g{item.gravity}</span>
    <span className={cl.z}>z{item.freezeZonks}</span>
    <span className={cl.e}>e{item.freezeEnemies}</span>
    <span className={cl.u}>u{item.unusedByte}</span>
    {/* TODO: <span>{item.isStdCompatible(width) && 'STD'}</span>*/}
    <TextButton icon={<svgs.DragV />} {...handleProps} className={cl.handle} />
  </div>
));
