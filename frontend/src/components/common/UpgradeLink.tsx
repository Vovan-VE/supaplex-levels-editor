import { createStore } from "effector";
import { useUnit } from "effector-react";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import { onUpgradeAvailable } from "backend";
import { APP_VERSION, VERSION_URL } from "configs";
import { TextButton } from "ui/button";
import { ColorType, ContainerProps } from "ui/types";

let UpgradeLink: FC<ContainerProps> | null = null;
if (onUpgradeAvailable) {
  const parseVer = (v: string) => {
    const n = v.split("-", 2)[0].split(".").map(Number);
    return n.every(Number.isInteger) ? n : null;
  };
  const cmpVer = (a: string, b: string) => {
    const av = parseVer(a);
    const bv = parseVer(b);
    if (av) {
      if (!bv) {
        return 1;
      }
    } else {
      if (bv) {
        return -1;
      }
      return 0;
    }
    for (let i = 0; i < av.length || i < bv.length; i++) {
      const an = av[i] ?? 0;
      const bn = bv[i] ?? 0;
      if (an !== bn) {
        return an - bn;
      }
    }
    return 0;
  };

  const $upgradeAvailable = createStore("").on(
    onUpgradeAvailable,
    (prev, next) => {
      if (cmpVer(prev || (APP_VERSION ?? ""), next) < 0) {
        return next;
      }
      return prev;
    },
  );

  UpgradeLink = (props) => {
    const { t } = useTranslation();
    const upgradeAvailable = useUnit($upgradeAvailable);
    return upgradeAvailable ? (
      <TextButton
        {...props}
        href={VERSION_URL}
        uiColor={ColorType.MUTE}
        title={t("desktop:app.NewVersionAvailable")}
      >
        ⇡ {upgradeAvailable}
      </TextButton>
    ) : null;
  };
}
export { UpgradeLink };
