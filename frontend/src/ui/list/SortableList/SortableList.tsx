import { FC, useCallback, useMemo, useState } from "react";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import { ValidKey } from "./internal";
import { defaultIdGetter, SortableListProps } from "./types";
import { SortableItem } from "./SortableItem";

// https://docs.dndkit.com/presets/sortable#drag-overlay

export const SortableList = <
  T,
  ID extends ValidKey = ValidKey,
  E extends HTMLElement = HTMLDivElement,
>({
  items,
  onSort,
  idGetter = defaultIdGetter<ID>,
  itemRenderer: ItemRenderer,
}: SortableListProps<T, ID, E>): ReturnType<FC> => {
  const [activeId, setActiveId] = useState<ID | null>(null);
  const ids = useMemo(() => items.map(idGetter), [items, idGetter]);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
        // delay: 750,
      },
    }),
    // From examples. Not sure if it's necessary and unconditionally.
    // useSensor(KeyboardSensor, {
    //   coordinateGetter: sortableKeyboardCoordinates,
    // }),
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={useCallback(
        ({ active }: DragStartEvent) => setActiveId(active.id as ID),
        [],
      )}
      onDragEnd={useCallback(
        ({ active, over }: DragEndEvent) => {
          if (over && active.id !== over.id) {
            const oldIndex = ids.indexOf(active.id as ID);
            const newIndex = ids.indexOf(over.id as ID);
            onSort(arrayMove(items as T[], oldIndex, newIndex));
          }
          setActiveId(null);
        },
        [onSort, items, ids],
      )}
    >
      <SortableContext
        items={ids}
        // TODO: enum option for different sorting strategy
        strategy={horizontalListSortingStrategy}
      >
        {items.map((item, i) => (
          <SortableItem
            key={ids[i]}
            index={i}
            id={ids[i]}
            item={item}
            itemRenderer={ItemRenderer}
          />
        ))}
      </SortableContext>
      <DragOverlay>
        {activeId !== null &&
          ((index = ids.indexOf(activeId)) => (
            <ItemRenderer index={index} item={items[index]} isDragging />
          ))()}
      </DragOverlay>
    </DndContext>
  );
};
