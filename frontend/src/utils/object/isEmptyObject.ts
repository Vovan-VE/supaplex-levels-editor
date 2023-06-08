export const isEmptyObject = (o: object): boolean => {
  for (let key in o) {
    if (o.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
};
