import cn from "classnames";
import {
  FC,
  forwardRef,
  MutableRefObject,
  PropsWithChildren,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { AnyKey } from "@cubux/types";
import { useMergeRefs } from "utils/react";
import { SortableItemProps, SortableList } from "../../list";
import { ColorType, ContainerProps } from "../../types";
import { Button, ButtonProps } from "../Button";
import { Toolbar } from "../Toolbar";
import cl from "./TabsButtons.module.scss";

type P = PropsWithChildren<ButtonProps> & {
  key: string;
  curRef?: MutableRefObject<HTMLButtonElement | null>;
};
const Item = forwardRef<HTMLButtonElement, SortableItemProps<P>>(
  (
    {
      item: { key, curRef, className, children, ...props },
      isDragging,
      itemProps,
      handleProps,
    },
    ref,
  ) => (
    <Button
      ref={useMergeRefs(ref, curRef)}
      {...props}
      {...itemProps}
      {...handleProps}
      className={cn(className, isDragging && cl._dragging)}
    >
      {children}
    </Button>
  ),
);

export interface TabItem<K extends AnyKey = AnyKey> {
  key: K;
  text: ReactNode;
  uiColor?: ColorType;
}

interface Props<K extends AnyKey> extends ContainerProps {
  tabs: readonly TabItem<K>[];
  current?: K;
  onClick?: (key: K) => void;
  onSort?: (order: readonly K[]) => void;
}

export const TabsButtons = <K extends AnyKey = AnyKey>({
  tabs,
  current,
  onClick,
  onSort,
  className,
  ...rest
}: Props<K>): ReturnType<FC> => {
  const refCur = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    // FIXME: doesn't work with sortable
    refCur.current?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
      behavior: "smooth",
    });
  }, [current]);

  const handleSort = useCallback(
    // REFACT: key is `string` here, not `K`
    (items: readonly P[]) => onSort?.(items.map(({ key }) => key as K)),
    [onSort],
  );

  const items = useMemo(
    () =>
      tabs.map<P>(({ key, text, uiColor }) => ({
        key: String(key),
        curRef: key === current ? refCur : undefined,
        asLink: key !== current,
        uiColor,
        onClick: onClick && (() => onClick(key)),
        children: text,
      })),
    [tabs, onClick, current],
  );

  return (
    <Toolbar {...rest} withBG={false} className={cn(cl.root, className)}>
      {onSort ? (
        <SortableList
          items={items}
          onSort={handleSort}
          itemRenderer={Item}
          direction="H"
        />
      ) : (
        items.map((item, i) => (
          <Item key={item.key} item={item} itemProps={{}} index={i} />
        ))
      )}
    </Toolbar>
  );
};
