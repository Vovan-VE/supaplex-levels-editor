import { useCallback, useMemo, useState } from "react";
import { TileCoords } from "components/settings/display";
import { Button } from "ui/button";
import { Dialog } from "ui/feedback";
import { Checkbox, RadioGroup, RadioOptions } from "ui/input";
import { ColorType } from "ui/types";
import { InteractionDialogProps } from "../types";
import { InlineTile } from "./InlineTile";
import { ISupaplexSpecPortProps, SPEC_PORT_MAX_COUNT } from "./internal";
import {
  isSpecPort,
  setPortIsSpecial,
  TILE_ELECTRON,
  TILE_MURPHY,
  TILE_SNIK_SNAK,
  TILE_ZONK,
} from "./tiles-id";
import { ISupaplexLevel } from "./types";

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
  const tile = level.getTile(x, y);
  const wasSpecial = isSpecPort(tile);
  const hadProps = useMemo(() => level.findSpecPort(x, y), [x, y, level]);
  const canSetSpecPort =
    Boolean(hadProps) || level.specPortsCount < SPEC_PORT_MAX_COUNT;

  const [isSpecial, setIsSpecial] = useState(wasSpecial);
  const [port, setPort] = useState(hadProps);

  const handleOK = useCallback(() => {
    let next = level.setTile(x, y, setPortIsSpecial(tile, isSpecial));
    if (isSpecial) {
      next = next.setSpecPort(x, y, port);
    }
    submit(next);
  }, [submit, level, port, isSpecial, tile, x, y]);

  const options = useMemo<RadioOptions<boolean>>(
    () => [
      {
        value: false,
        label: (
          <>
            <InlineTile tile={setPortIsSpecial(tile, false)} /> Regular Port
          </>
        ),
      },
      {
        value: true,
        label: (
          <>
            <InlineTile tile={setPortIsSpecial(tile, true)} /> Special Port
          </>
        ),
      },
    ],
    [tile],
  );

  const handleGravity = useCallback(
    (setsGravity: boolean) =>
      setPort((port) => ({ ...(port ?? fallbackProps), setsGravity })),
    [],
  );
  const handleZonks = useCallback(
    (setsFreezeZonks: boolean) =>
      setPort((port) => ({ ...(port ?? fallbackProps), setsFreezeZonks })),
    [],
  );
  const handleEnemies = useCallback(
    (setsFreezeEnemies: boolean) =>
      setPort((port) => ({ ...(port ?? fallbackProps), setsFreezeEnemies })),
    [],
  );

  const { setsGravity, setsFreezeZonks, setsFreezeEnemies } =
    port ?? fallbackProps;

  return (
    <Dialog
      open
      title="Port properties"
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
        <TileCoords x={x} y={y} /> <InlineTile tile={tile} />
      </p>

      {(canSetSpecPort || wasSpecial) && (
        <RadioGroup
          options={options}
          value={isSpecial}
          onChange={setIsSpecial}
        />
      )}

      {isSpecial && canSetSpecPort && (
        <>
          {wasSpecial && !hadProps && (
            <p>
              <i>
                <strong>NOTICE:</strong> This Special Port has no properties in
                level, and so it behaves as Regular Port. It will be fixed when
                you complete by [OK].
              </i>
            </p>
          )}
          <p>
            When Murphy pass thru this Special Port, the game conditions will
            change to:
          </p>
          {/* TODO: replace checkboxes with labeled switches: `(* off)` <=> `(on *)` */}
          <div>
            <Checkbox
              checked={setsGravity}
              onChange={handleGravity}
              disabled={!isSpecial}
            >
              <InlineTile tile={TILE_MURPHY} /> Gravity:{" "}
              <b>{setsGravity ? "ON" : "OFF"}</b>
            </Checkbox>
          </div>
          <div>
            <Checkbox
              checked={setsFreezeZonks}
              onChange={handleZonks}
              disabled={!isSpecial}
            >
              <InlineTile tile={TILE_ZONK} /> Zonks freeze:{" "}
              <b>{setsFreezeZonks ? "ON" : "OFF"}</b>
            </Checkbox>
          </div>
          <div>
            <Checkbox
              checked={setsFreezeEnemies}
              onChange={handleEnemies}
              disabled={!isSpecial}
            >
              <InlineTile tile={TILE_SNIK_SNAK} />
              <InlineTile tile={TILE_ELECTRON} /> Enemies freeze:{" "}
              <b>{setsFreezeEnemies ? "ON" : "OFF"}</b>
            </Checkbox>
          </div>
        </>
      )}

      {!canSetSpecPort && (!wasSpecial || isSpecial) && (
        <>
          Max count {SPEC_PORT_MAX_COUNT} of Special Ports Properties is already
          reached, so cannot <i>add</i> more.
        </>
      )}
    </Dialog>
  );
};
