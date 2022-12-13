import { FC, useCallback } from "react";
import {
  DISPLAY_ORDER,
  DriverName,
  getDriver,
  getTilesForToolbar,
} from "drivers";
import { Select, SelectOption } from "ui/input";

interface Props {
  driverName: DriverName;
  tile: number;
  onChange: (tile: number) => void;
}

const OPTIONS = new Map(
  DISPLAY_ORDER.map((name) => {
    const { tiles, TileRender } = getDriver(name);
    return [
      name,
      getTilesForToolbar(tiles).map<SelectOption<number>>(
        ([, { value = -1, title }]) => ({
          value,
          label: title,
          icon: <TileRender tile={value} />,
        }),
      ),
    ];
  }),
);

export const TileSelect: FC<Props> = ({ driverName, tile, onChange }) => {
  const options = OPTIONS.get(driverName);
  const handleChange = useCallback(
    (o: SelectOption<number> | null) => {
      onChange(o?.value ?? -1);
    },
    [onChange],
  );

  return (
    <Select
      options={options!}
      value={options?.find((o) => o.value === tile) ?? null}
      onChange={handleChange}
    />
  );
};
