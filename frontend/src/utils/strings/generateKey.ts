export const generateKey = (() => {
  let lastTime: number;
  let lastIndex = 0;
  return () => {
    const time = Date.now();
    if (time === lastTime) {
      ++lastIndex;
    } else {
      lastTime = time;
      lastIndex = 0;
    }
    return `${time}.${lastIndex}.${Math.floor(Math.random() * 0x1000000)
      .toString(16)
      .padStart(6, "0")}`;
  };
})();
