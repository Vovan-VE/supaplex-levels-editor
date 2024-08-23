const hasOwn = Object.hasOwn;

export const isEmptyObject = (o: object): boolean => {
  for (const key in o) {
    if (hasOwn(o, key)) {
      return false;
    }
  }
  return true;
};
