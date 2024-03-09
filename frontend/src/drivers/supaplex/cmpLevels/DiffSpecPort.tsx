import { FC } from "react";
import { useTranslation } from "react-i18next";
import { DiffValue } from "ui/feedback";
import { TileCoords } from "components/settings/display";
import { ISupaplexSpecPortRecordReadonly } from "../internal";
import { SpecPortWhichProps } from "./types";

export const DiffSpecPort: FC<{
  port: ISupaplexSpecPortRecordReadonly;
  side: 0 | 1;
  which: SpecPortWhichProps;
}> = ({
  port: { x, y, gravity, freezeZonks, freezeEnemies, unusedByte },
  side,
  which,
}) => {
  const { t } = useTranslation();
  return (
    <div>
      <span>
        {which.x && which.y ? (
          <DiffValue side={side} different>
            <TileCoords x={x} y={y} />
          </DiffValue>
        ) : (
          <TileCoords
            x={x}
            y={y}
            format={(x, y, b) => (
              <>
                [
                <DiffValue side={side} different={which.x}>
                  {x}
                </DiffValue>
                {"; "}
                <DiffValue side={side} different={which.y}>
                  {y}
                </DiffValue>
                ]{b}
              </>
            )}
          />
        )}
      </span>
      <br />
      <span>
        {t("main:supaplex.features.Gravity")}
        {": "}
        <DiffValue side={side} different={which.gravity}>
          <b>{String(gravity)}</b>
        </DiffValue>
      </span>
      <br />
      <span>
        {t("main:supaplex.features.FreezeZonks")}
        {": "}
        <DiffValue side={side} different={which.freezeZonks}>
          <b>{String(freezeZonks)}</b>
        </DiffValue>
      </span>
      <br />
      <span>
        {t("main:supaplex.features.FreezeEnemies")}
        {": "}
        <DiffValue side={side} different={which.freezeEnemies}>
          <b>{String(freezeEnemies)}</b>
        </DiffValue>
      </span>
      <br />
      <span>
        {t("main:supaplex.features.UnusedByte")}
        {": "}
        <DiffValue side={side} different={which.unusedByte}>
          <b>{unusedByte}</b>
        </DiffValue>
      </span>
    </div>
  );
};
