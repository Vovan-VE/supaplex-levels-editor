import { msgBox } from "ui/feedback";
import { InfoContent } from "./InfoContent";

export const showInfoDialog = () =>
  msgBox(<InfoContent />, {
    size: "full",
    closeSetAutoFocus: true,
    button: {
      text: "Close",
      autoFocus: false,
    },
  });
