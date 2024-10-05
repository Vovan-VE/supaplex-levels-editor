import * as iS from "./instanceSemaphore";
import * as D from "./onDeactivate";
import * as dnd from "./dnd";

export const init = () => {
  iS.init();
  D.init();
  dnd.init();
};
