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
    const [rnd] = window.crypto.getRandomValues(new Uint32Array(1));
    return `${time}.${lastIndex}.${rnd.toString(16).padStart(8, "0")}`;
  };
})();
