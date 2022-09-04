import { ComponentProps, FC, useCallback, useState } from "react";
import { Context } from "./context";

type Props = ComponentProps<"div">;

const nextIndex = (() => {
  let lastIndex = 0;
  return () => ++lastIndex;
})();

export const PopupContainer: FC<Props> = ({ children, id, ...rest }) => {
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const getElement = useCallback(
    (): HTMLElement => element || document.body,
    [element],
  );
  const [index] = useState(nextIndex);

  return (
    <>
      {element && (
        <Context.Provider value={getElement}>{children}</Context.Provider>
      )}
      <div
        {...rest}
        ref={setElement}
        // for using with portals
        id={id ?? `popup-container_${index}`}
      />
    </>
  );
};
