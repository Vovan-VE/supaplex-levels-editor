export const isOffsetInRange = (
  offset: number,
  start: number,
  length: number,
) => offset >= start && offset < start + length;
