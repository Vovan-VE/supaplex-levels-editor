import cn from "classnames";
import { useUnit } from "effector-react";
import { FC, RefCallback, useEffect, useMemo, useState } from "react";
import {
  $toasts,
  toastDidShown,
  ToastInstance,
  ToastPhase,
} from "models/ui/toasts";
import { IconContainer } from "ui/icon";
import { ColorType } from "ui/types";
import cl from "./Toaster.module.scss";

export const Toaster: FC = () => (
  <div className={cl.root}>
    {Array.from(useUnit($toasts).values(), (toast) => (
      <Toast key={toast.id} {...toast} />
    ))}
  </div>
);

const CL_PHASE: Partial<Record<ToastPhase, string>> = {
  [ToastPhase.APPEAR]: cl._appear,
  [ToastPhase.SHOWN]: cl._shown,
  [ToastPhase.DISAPPEAR]: cl._disappear,
};
const CL_COLOR: Record<ColorType, string> = {
  [ColorType.DEFAULT]: cl._default,
  [ColorType.MUTE]: cl._mute,
  [ColorType.PRIMARY]: cl._primary,
  [ColorType.DANGER]: cl._danger,
  [ColorType.WARN]: cl._warn,
  [ColorType.SUCCESS]: cl._success,
};

const Toast: FC<ToastInstance> = ({
  id,
  phase,
  toast: { message, icon, color },
}) => {
  useEffect(() => void toastDidShown(id), [id]);

  const [origHeight, setOrigHeight] = useState(0);
  const trackHeight = phase === ToastPhase.APPEAR;
  const ref = useMemo<RefCallback<HTMLDivElement> | undefined>(() => {
    if (!trackHeight) return;
    return (div) => {
      if (!div) return;
      setOrigHeight(div.getBoundingClientRect().height);
      const ob = new ResizeObserver((entries) => {
        for (const en of entries) {
          setOrigHeight(en.contentRect.height);
        }
      });
      ob.observe(div, { box: "content-box" });

      return () => ob.disconnect();
    };
  }, [trackHeight]);

  return (
    <div
      ref={ref}
      className={cn(
        cl.instance,
        CL_COLOR[color ?? ColorType.DEFAULT],
        CL_PHASE[phase],
      )}
      style={{ "--m": `-${origHeight}px` } as object}
    >
      <div className={cl.content}>
        {icon && <IconContainer className={cl.icon}>{icon}</IconContainer>}
        <div className={cl.message}>{message}</div>
      </div>
    </div>
  );
};
