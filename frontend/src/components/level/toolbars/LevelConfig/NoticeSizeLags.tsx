import { FC } from "react";
import { Trans } from "i18n/Trans";
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
      <Trans i18nKey="main:level.resize.NoticeLargeSizeLags" />
    </p>
  );
};
