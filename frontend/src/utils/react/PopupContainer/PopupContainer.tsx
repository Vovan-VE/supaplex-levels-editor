import { ComponentProps, FC, useCallback, useId, useState } from "react";
import { useRefBySetState } from "../useRefBySetState";
import { Context } from "./context";

type Props = ComponentProps<"div">;

export const PopupContainer: FC<Props> = ({ children, id, ...rest }) => {
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const getElement = useCallback(
    (): HTMLElement => element || document.body,
    [element],
  );
  const localId = useId();

  return (
    <>
      {element && <Context value={getElement}>{children}</Context>}
      <div
        {...rest}
        ref={useRefBySetState(setElement)}
        // for using with portals
        id={id ?? `popup-container_${localId}`}
      />
    </>
  );
};
