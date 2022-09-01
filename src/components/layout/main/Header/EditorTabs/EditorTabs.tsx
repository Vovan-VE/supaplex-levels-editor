import { FC, useEffect, useMemo, useRef } from "react";
import cn from "classnames";
import { useStore } from "effector-react";
import { $currentKey, $levelsets, setCurrentLevelset } from "models/levelsets";
import { Button, Toolbar } from "ui/button";
import { ContainerProps } from "ui/types";
import cl from "./EditorTabs.module.scss";

interface Props extends ContainerProps {}

export const EditorTabs: FC<Props> = ({ className, ...rest }) => {
  const levelsets = useStore($levelsets);
  const currentKey = useStore($currentKey);

  const refCur = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    refCur.current?.scrollIntoView({
      block: "center",
      inline: "center",
    });
  }, []);

  const handleClick = useMemo(
    () => [...levelsets.keys()].map((key) => () => setCurrentLevelset(key)),
    [levelsets],
  );

  return (
    <Toolbar {...rest} withBG={false} className={cn(cl.root, className)}>
      {[...levelsets].map(([key, { name }], i) => (
        <Button
          key={key}
          ref={key === currentKey ? refCur : undefined}
          asLink={key !== currentKey}
          onClick={handleClick[i]}
        >
          {name}
        </Button>
      ))}
    </Toolbar>
  );
};
