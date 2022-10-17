import { useCallback, useState } from "react";
import { Button } from "ui/button";
import { Dialog } from "ui/feedback";
import { IconContainer } from "ui/icon";
import { Checkbox } from "ui/input";
import { ColorType } from "ui/types";
import { InteractionDialogProps } from "../types";
import { ISupaplexLevel } from "./types";
import { ISupaplexSpecPortProps } from "./internal";
import { Tile } from "./Tile";
import {
  TILE_ELECTRON,
  TILE_MURPHY,
  TILE_SNIK_SNAK,
  TILE_ZONK,
} from "./tiles-id";
import cl from "./SpecPortDialog.module.scss";

const fallbackProps: ISupaplexSpecPortProps = {
  setsGravity: false,
  setsFreezeZonks: false,
  setsFreezeEnemies: false,
};

interface Props<T extends ISupaplexLevel> extends InteractionDialogProps<T> {}

export const SpecPortDialog = <T extends ISupaplexLevel>({
  cell,
  level,
  submit,
  cancel,
}: Props<T>) => {
  const { x, y } = cell;
  const [port, setPort] = useState(
    () => level.findSpecPort(x, y) ?? fallbackProps,
  );

  const handleOK = useCallback(
    () => submit(level.setSpecPort(x, y, port)),
    [submit, level, port, x, y],
  );

  const handleGravity = useCallback(
    (setsGravity: boolean) => setPort((port) => ({ ...port, setsGravity })),
    [],
  );
  const handleZonks = useCallback(
    (setsFreezeZonks: boolean) =>
      setPort((port) => ({ ...port, setsFreezeZonks })),
    [],
  );
  const handleEnemies = useCallback(
    (setsFreezeEnemies: boolean) =>
      setPort((port) => ({ ...port, setsFreezeEnemies })),
    [],
  );

  const { setsGravity, setsFreezeZonks, setsFreezeEnemies } = port;

  return (
    <Dialog
      open
      title="Special Post properties"
      size="small"
      buttons={
        <>
          <Button uiColor={ColorType.SUCCESS} onClick={handleOK}>
            OK
          </Button>
          <Button uiColor={ColorType.MUTE} onClick={cancel}>
            Cancel
          </Button>
        </>
      }
      onClose={cancel}
    >
      <p>
        <code title="Zero based coordinates">
          [{x}; {y}]
        </code>{" "}
        <IconContainer className={cl.tile}>
          <Tile tile={level.getTile(x, y)} />
        </IconContainer>
      </p>
      {/* TODO: replace checkboxes with labeled switches: `(* off)` <=> `(on *)` */}
      <div>
        <Checkbox checked={setsGravity} onChange={handleGravity}>
          <IconContainer className={cl.tile}>
            <Tile tile={TILE_MURPHY} />
          </IconContainer>{" "}
          Gravity: <b>{setsGravity ? "ON" : "OFF"}</b>
        </Checkbox>
      </div>
      <div>
        <Checkbox checked={setsFreezeZonks} onChange={handleZonks}>
          <IconContainer className={cl.tile}>
            <Tile tile={TILE_ZONK} />
          </IconContainer>{" "}
          Zonks freeze: <b>{setsFreezeZonks ? "ON" : "OFF"}</b>
        </Checkbox>
      </div>
      <div>
        <Checkbox checked={setsFreezeEnemies} onChange={handleEnemies}>
          <IconContainer className={cl.tile}>
            <Tile tile={TILE_SNIK_SNAK} />
            <Tile tile={TILE_ELECTRON} />
          </IconContainer>{" "}
          Enemies freeze: <b>{setsFreezeEnemies ? "ON" : "OFF"}</b>
        </Checkbox>
      </div>
    </Dialog>
  );
};
