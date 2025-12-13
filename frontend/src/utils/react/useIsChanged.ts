import { useState } from "react";

export function useIsChanged<T>(value: T) {
  const [prev, setPrev] = useState(() => value);
  if (Object.is(value, prev)) return false;
  setPrev(() => value);
  return true;
}
