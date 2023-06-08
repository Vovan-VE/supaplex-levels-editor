import { useStore } from "effector-react";
import { ReactComponent as MurphySad } from "assets/img/murphy-sad.svg";
import { useTileCoordsDisplay } from "components/settings/display";
import { TILE_MURPHY } from "drivers/supaplex/tiles-id";
import { Tile } from "drivers/supaplex/Tile";
import { $playerPos, findPlayer } from "models/levelsets";
import { TextButton } from "ui/button";

export const FindPlayerButton = () => {
  const playerPos = useStore($playerPos);
  const posStr = useTileCoordsDisplay(
    playerPos ? { x: playerPos[0], y: playerPos[1] } : { x: 0, y: 0 },
  );
  return playerPos ? (
    <TextButton
      icon={<Tile tile={TILE_MURPHY} style={{ height: "100%" }} />}
      title={`At ${posStr}`}
      onClick={findPlayer}
    />
  ) : (
    <TextButton icon={<MurphySad />} disabled />
  );
};
