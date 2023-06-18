import { useMemo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ValidKey } from "./internal";
import { SortableItemComponent } from "./types";

interface Props<T, ID extends ValidKey, E> {
  id: ID;
  index: number;
  item: T;
  itemRenderer: SortableItemComponent<T, E>;
}

export const SortableItem = <T, ID extends ValidKey, E extends HTMLElement>({
  id,
  index,
  item,
  itemRenderer: ItemRenderer,
}: Props<T, ID, E>) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    // isDragging,
  } = useSortable({ id });

  return (
    <ItemRenderer
      ref={setNodeRef}
      index={index}
      item={item}
      itemProps={useMemo(
        () => ({
          style: {
            transform: CSS.Transform.toString(transform),
            transition,
            // visibility: isDragging ? 'hidden' : undefined,
          },
          ...attributes,
        }),
        [transform, transition, attributes],
      )}
      handleProps={listeners}
    />
  );
};
