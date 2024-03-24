import { msgBox } from "ui/feedback";
import { Trans } from "i18n/Trans";
import { InfoContent } from "./InfoContent";

export const showInfoDialog = () =>
  msgBox(<InfoContent />, {
    size: "full",
    closeSetAutoFocus: true,
    button: {
      text: <Trans i18nKey="main:common.buttons.Close" />,
      autoFocus: false,
    },
  });
