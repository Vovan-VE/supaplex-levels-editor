import * as iS from "./instanceSemaphore";
import * as D from "./onDeactivate";

export const init = () => {
  iS.init();
  D.init();
};
