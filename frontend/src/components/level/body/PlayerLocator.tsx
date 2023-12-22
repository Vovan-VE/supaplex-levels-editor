import { useUnit } from "effector-react";
import { FC, useEffect, useLayoutEffect, useRef, useState } from "react";
import { $playerPos, scrollToPlayer } from "models/levelsets";
import cl from "./PlayerLocator.module.scss";

export const PlayerLocator: FC = () => {
  const pos = useUnit($playerPos);
  const anchor = useRef<HTMLDivElement | null>(null);
  const [id, setId] = useState(0);
  useEffect(() => scrollToPlayer.watch(() => setId((n) => n + 1)), []);
  useLayoutEffect(() => {
    if (id > 0) {
      anchor.current?.scrollIntoView({
        block: "center",
        inline: "center",
      });
    }
  }, [id]);
  if (!pos || !id) {
    return null;
  }
  return (
    <div className={cl.root} style={{ "--x": pos[0], "--y": pos[1] } as {}}>
      <div
        // to cause remounting, which itself is to restart animation
        key={id}
        ref={anchor}
        className={cl.anchor}
      />
    </div>
  );
};
