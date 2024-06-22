import { ForwardRefExoticComponent, RefAttributes } from "react";
import { isValidKey, SortDirection, ValidKey } from "./internal";

export interface SortableListProps<
  T,
  ID extends ValidKey = ValidKey,
  E extends HTMLElement = HTMLDivElement,
> {
  items: readonly T[];
  onSort: (items: readonly T[]) => void;
  idGetter?: IdGetter<T, ID>;
  /**
   * Item render component
   *
   * ```ts
   * const Item = forwardRef<HTMLDivElement, SortableItemProps<T>>(
   *   ({item, itemProps, handleProps}, ref) => (
   *     <div ref={ref} {...itemProps} {...handleProps}>
   *       // or: <div {...handleProps}>handle</div>
   *       ...render `item`...
   *     </div>
   *   ),
   * );
   * ```
   */
  itemRenderer: SortableItemComponent<T, E>;
  direction?: SortDirection;
}

const hasOwn = Object.hasOwn;

export type IdGetter<T, ID extends ValidKey> = (item: T) => ID;
export const defaultIdGetter = <ID extends ValidKey = ValidKey>(
  item: any,
): ID => {
  if (isValidKey(item)) {
    return item as ID;
  }
  if (typeof item === "object" && item) {
    for (const k of ["key", "id"]) {
      if (hasOwn(item, k) && isValidKey(item[k])) {
        return item[k] as ID;
      }
    }
  }
  throw new TypeError("Cannot find item ID with default `idGetter`");
};

export interface SortableItemProps<T> {
  index: number;
  item: T;
  /** Props for the sorting item element where `ref` goes */
  itemProps?: object;
  isDragging?: boolean;
  /**
   * Props for activator element (drag handle to start drag). Can be the item
   * itself, or its sub element.
   */
  handleProps?: object;
}

/**
 * Item render component
 *
 * ```ts
 * const Item = forwardRef<HTMLDivElement, SortableItemProps<T>>(
 *   ({item, itemProps, handleProps}, ref) => (
 *     <div ref={ref} {...itemProps} {...handleProps}>
 *       // or: <div {...handleProps}>handle</div>
 *       ...render `item`...
 *     </div>
 *   ),
 * );
 * ```
 */
export type SortableItemComponent<T, E> = ForwardRefExoticComponent<
  SortableItemProps<T> & RefAttributes<E>
>;
