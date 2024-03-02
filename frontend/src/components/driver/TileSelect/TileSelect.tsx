import { FC, ReactNode, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AnyKey } from "@cubux/types";
import {
  DISPLAY_ORDER,
  DriverName,
  getDriver,
  getTilesForToolbar,
} from "drivers";
import { TranslationGetter } from "i18n/types";
import { Select, SelectOption } from "ui/input";
import cl from "./TileSelect.module.scss";

type TrSelectOption<V extends AnyKey> = Omit<
  SelectOption<V>,
  "labelSelected"
> & { labelSelected: TranslationGetter };

const OPTIONS = new Map(
  DISPLAY_ORDER.map((name) => {
    const { tiles, TileRender } = getDriver(name);
    return [
      name,
      getTilesForToolbar(tiles)
        .filter(
          ([, { value, metaTile }]) =>
            !metaTile || metaTile.primaryValue === value,
        )
        .map<TrSelectOption<number>>(([, { value, title }]) => ({
          value,
          labelSelected: title,
          icon: <TileRender tile={value} />,
        })),
    ];
  }),
);

const useOptions = (driverName: DriverName) => {
  const { t } = useTranslation();
  return useMemo(
    () =>
      OPTIONS.get(driverName)!.map((o) => ({
        ...o,
        labelSelected: o.labelSelected(t),
      })),
    [t, driverName],
  );
};

const classNames = {
  menuList: () => cl.menuList,
  option: () => cl.option,
};

interface Props {
  driverName: DriverName;
  // TODO: showVariants?: bool;
  canClear?: boolean;
  placeholder?: ReactNode;
}
interface PropsSingle extends Props {
  tile: number;
  onChange: (tile: number) => void;
}
interface PropsMulti extends Props {
  tile: readonly number[] | ReadonlySet<number>;
  onChange: (tile: number[]) => void;
}

export const TileSelect: FC<PropsSingle> = ({
  driverName,
  tile,
  onChange,
  canClear = false,
  ...rest
}) => {
  const options = useOptions(driverName);
  const handleChange = useCallback(
    (o: SelectOption<number> | null) => onChange(o?.value ?? -1),
    [onChange],
  );

  return (
    <Select
      {...rest}
      options={options}
      value={options.find((o) => o.value === tile) ?? null}
      onChange={handleChange}
      className={cl.root}
      classNames={classNames}
      isClearable={canClear}
    />
  );
};

export const TileSelectMulti: FC<PropsMulti> = ({
  driverName,
  tile,
  onChange,
  canClear = false,
  ...rest
}) => {
  const options = useOptions(driverName);
  const handleChange = useCallback(
    (o: readonly SelectOption<number>[]) => onChange(o.map((o) => o.value)),
    [onChange],
  );
  const selected = new Set(tile);

  return (
    <Select
      {...rest}
      isMulti
      options={options}
      value={options.filter((o) => selected.has(o.value))}
      onChange={handleChange}
      className={cl.root}
      classNames={classNames}
      isClearable={canClear}
    />
  );
};
