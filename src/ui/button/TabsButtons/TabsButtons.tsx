import { FC, ReactNode, useEffect, useMemo, useRef } from "react";
import { AnyKey } from "@cubux/types";
import cn from "classnames";
import { ContainerProps } from "../../types";
import { Button } from "../Button";
import { Toolbar } from "../Toolbar";
import cl from "./TabsButtons.module.scss";

export interface TabItem<K extends AnyKey = AnyKey> {
  key: K;
  text: ReactNode;
}

interface Props<K extends AnyKey> extends ContainerProps {
  tabs: readonly TabItem<K>[];
  current?: K;
  onClick?: (key: K) => void;
}

export const TabsButtons = <K extends AnyKey = AnyKey>({
  tabs,
  current,
  onClick,
  className,
  ...rest
}: Props<K>): ReturnType<FC> => {
  const refCur = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    refCur.current?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
      behavior: "smooth",
    });
  }, [current]);

  const handleClick = useMemo(
    () =>
      onClick &&
      tabs.map(
        ({ key }) =>
          () =>
            onClick(key),
      ),
    [tabs, onClick],
  );

  return (
    <Toolbar {...rest} withBG={false} className={cn(cl.root, className)}>
      {tabs.map(({ key, text }, i) => (
        <Button
          key={key}
          ref={key === current ? refCur : undefined}
          asLink={key !== current}
          onClick={handleClick?.[i]}
        >
          {text}
        </Button>
      ))}
    </Toolbar>
  );
};
