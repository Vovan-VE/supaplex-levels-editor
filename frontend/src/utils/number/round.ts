export function round(x: number, decimals: number = 0): number {
  if (0 === decimals) {
    return Math.round(x);
  }
  if (decimals > 0) {
    const scale = 10 ** decimals;
    return Math.round(Number(x) * scale) / scale;
  }
  throw new RangeError("Negative decimals");
}
