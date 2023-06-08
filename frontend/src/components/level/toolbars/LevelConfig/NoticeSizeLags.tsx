import { FC } from "react";
import { ContainerProps } from "ui/types";

interface Props extends ContainerProps {
  totalTiles: number;
}

export const NoticeSizeLags: FC<Props> = ({ totalTiles, ...rest }) => {
  // now 2000*2000 may lag for about 10 sec (inefficient flood fill algorithm)
  // so, 2000*2000/10 = 2000*200 is about 1 sec
  if (totalTiles <= 2000 * 200) {
    return null;
  }
  return (
    <p {...rest}>
      <strong>NOTICE:</strong> Large level may cause some lags while editing.
    </p>
  );
};
