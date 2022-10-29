import { FC } from "react";

interface Props {
  totalTiles: number;
}

export const NoticeSizeLags: FC<Props> = ({ totalTiles }) => {
  if (totalTiles <= 100 * 100) {
    return null;
  }
  return (
    <p>
      <strong>NOTICE:</strong> Large level still may cause some lags while
      editing.
    </p>
  );
};
