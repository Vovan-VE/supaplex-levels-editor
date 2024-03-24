import { FC, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { IBaseLevel } from "drivers";
import { Trans } from "i18n/Trans";
import { LevelBuffer } from "models/levelsets";
import { Button } from "ui/button";
import { Dialog, RenderPromptProps } from "ui/feedback";
import { SortableList } from "ui/list";
import { ColorType } from "ui/types";
import { ItemRender } from "./ItemRender";
import { Options } from "./types";
import cl from "./LevelsOrder.module.scss";

type I = LevelBuffer<IBaseLevel>;
type V = readonly I[];

interface Props extends RenderPromptProps<V>, Options {}

export const LevelsOrder: FC<Props> = ({
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
      title={t("main:levels.levelsOrder.Title")}
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
        <Trans i18nKey="main:levels.levelsOrder.Intro" />
      </p>

      <div
        className={cl.list}
        style={{ "--idx-chars": String(levels.length).length } as object}
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
