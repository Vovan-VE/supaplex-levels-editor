import { FC, forwardRef, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { IBaseLevel } from "drivers";
import { Trans } from "i18n/Trans";
import { LevelBuffer } from "models/levelsets";
import { Button, TextButton } from "ui/button";
import { Dialog, renderPrompt, RenderPromptProps } from "ui/feedback";
import { svgs } from "ui/icon";
import { SortableItemProps, SortableList } from "ui/list";
import { ColorType } from "ui/types";
import cl from "./LevelsOrder.module.scss";

type I = LevelBuffer<IBaseLevel>;
type V = readonly I[];

interface Options {
  levels: V;
}

export const promptLevelsOrder = (o: Options) =>
  renderPrompt<V>((p) => <LevelsOrder {...p} {...o} />);

interface Props extends RenderPromptProps<V>, Options {}

const LevelsOrder: FC<Props> = ({
  show,
  onSubmit,
  onCancel,
  levels: origLevels,
}) => {
  const { t } = useTranslation();

  const idGetter = useMemo(() => {
    const indices = new Map(origLevels.map((l, i) => [l, i]));
    return (l: I) => String(indices.get(l)!);
  }, [origLevels]);

  const [levels, setLevels] = useState(origLevels);
  const isSame = useMemo(
    () => levels.every((l, i) => l === origLevels[i]),
    [levels, origLevels],
  );

  const handleOk = useCallback(() => {
    if (isSame) {
      return;
    }
    onSubmit(levels);
  }, [levels, isSame, onSubmit]);

  return (
    <Dialog
      title={t("main:levels.levelsOrder.Title", "Levels order")}
      open={show}
      buttons={
        <>
          <Button
            uiColor={ColorType.SUCCESS}
            onClick={handleOk}
            disabled={isSame}
          >
            {t("main:common.buttons.OK")}
          </Button>
          <Button type="button" onClick={onCancel}>
            {t("main:common.buttons.Cancel")}
          </Button>
        </>
      }
      onClose={onCancel}
      className={cl.dialog}
      bodyClassName={cl.root}
    >
      <p className={cl.info}>
        <Trans
          i18nKey="main:levels.levelsOrder.Intro"
          defaults="Drag levels to change order in the file. <b>THIS OPERATION CANNOT BE UNDONE!</b>"
        />
      </p>

      <div
        className={cl.list}
        style={{ "--idx-chars": String(levels.length).length } as {}}
      >
        <SortableList
          items={levels}
          idGetter={idGetter}
          onSort={setLevels}
          itemRenderer={ItemRender}
        />
      </div>
    </Dialog>
  );
};

const ItemRender = forwardRef<HTMLDivElement, SortableItemProps<I>>(
  (
    {
      item: {
        undoQueue: { current: level },
      },
      itemProps,
      handleProps,
      index,
    },
    ref,
  ) => (
    <div ref={ref} {...itemProps} className={cl.item}>
      <div className={cl.index}>{index + 1}</div>
      <div className={cl.title}>{level.title}</div>
      <TextButton
        {...handleProps}
        icon={<svgs.DragV />}
        className={cl.handle}
      />
    </div>
  ),
);
