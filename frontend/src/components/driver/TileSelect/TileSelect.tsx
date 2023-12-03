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

interface Props {
  driverName: DriverName;
  tile: number;
  onChange: (tile: number) => void;
  // TODO: showVariants?: bool;
  canClear?: boolean;
  placeholder?: ReactNode;
}

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

export const TileSelect: FC<Props> = ({
  driverName,
  tile,
  onChange,
  canClear = false,
  ...rest
}) => {
  const { t } = useTranslation();
  const options = useMemo(
    () =>
      OPTIONS.get(driverName)!.map((o) => ({
        ...o,
        labelSelected: o.labelSelected(t),
      })),
    [t, driverName],
  );
  const handleChange = useCallback(
    (o: SelectOption<number> | null) => {
      onChange(o?.value ?? -1);
    },
    [onChange],
  );

  return (
    <Select
      {...rest}
      options={options!}
      value={options?.find((o) => o.value === tile) ?? null}
      onChange={handleChange}
      className={cl.root}
      classNames={{
        menuList: () => cl.menuList,
        option: () => cl.option,
      }}
      isClearable={canClear}
    />
  );
};
