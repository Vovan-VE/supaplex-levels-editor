import { FC } from "react";

interface Props {
  totalTiles: number;
}

export const NoticeSizeLags: FC<Props> = ({ totalTiles }) => {
  // The "HUGEMAZ1.MPX" takes 2+ sec lag on my current PC for every change in
  // tiles (including first render after switch/open the level). It's 202*202.
  // Following calculations are hypothetical and not accurate.
  // So, 202*202 tiles will take 2+ sec.
  // Say, like 200*200 will take > 2 sec. So it's like every 200*100 tiles will
  // take +1 sec to lag.
  const sec = totalTiles / (200 * 100);
  if (sec < 0.5) {
    return null;
  }
  const level =
    sec < 1 ? (
      <i>short</i>
    ) : sec < 1.5 ? (
      <i>uncomfortable</i>
    ) : sec < 2 ? (
      <strong>some</strong>
    ) : (
      <strong>HEAVY</strong>
    );
  return (
    <p>
      <strong>NOTICE:</strong> Approximate lags level is {level} (about{" "}
      {sec.toFixed(1)}+ sec.).
      <br />
      The bigger level size is, the more lags you will experience with such
      level. Lags depend directly on level size and on your device performance.
      <br />
      If you are not sure, try in separate level: first 100x100, then 200x100,
      then 200x200, etc.
    </p>
  );
};
