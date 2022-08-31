import { FC, useEffect, useMemo, useRef, useState } from "react";
import cn from "classnames";
import { Button, Toolbar } from "ui/button";
import { ContainerProps } from "ui/types";
import cl from "./EditorTabs.module.scss";

interface Props extends ContainerProps {}

const _items = ["Foo bar", "Lorem ipsum", "Dolor", "Sit amet"];

export const EditorTabs: FC<Props> = ({ className, ...rest }) => {
  const [curI, setCurI] = useState<number>();
  const refCur = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    refCur.current?.scrollIntoView({
      block: "center",
      inline: "center",
    });
  }, []);

  const handleClick = useMemo(
    () => Array.from({ length: _items.length }).map((_, i) => () => setCurI(i)),
    [],
  );

  return (
    <Toolbar {...rest} withBG={false} className={cn(cl.root, className)}>
      {_items.map((s, i) => (
        <Button
          key={i}
          ref={i === curI ? refCur : undefined}
          asLink={i !== curI}
          onClick={handleClick[i]}
        >
          {s}
        </Button>
      ))}
    </Toolbar>
  );
};
