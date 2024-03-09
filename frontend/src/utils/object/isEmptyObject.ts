const hasOwn = Object.prototype.hasOwnProperty;

export const isEmptyObject = (o: object): boolean => {
  for (const key in o) {
    if (hasOwn.call(o, key)) {
      return false;
    }
  }
  return true;
};
