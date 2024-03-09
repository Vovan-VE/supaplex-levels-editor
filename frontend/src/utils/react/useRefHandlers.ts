import { useEffect, useRef } from "react";
import { isNotNull } from "utils/fn";

type Handler<A extends any[] = any[]> = (...args: A) => void;

/**
 * Returns constant handler to trigger all given handlers
 *
 * The result is consistent by ref to be useful with promises in callbacks.
 *
 * @param handlers
 */
export const useRefHandlers = <H extends Handler>(
  ...handlers: (H | undefined)[]
) => {
  const refResult = useRef<H>();

  useEffect(() => {
    const given = handlers.filter(isNotNull);
    switch (given.length) {
      case 0:
        refResult.current = undefined;
        break;

      case 1:
        [refResult.current] = given;
        break;

      default:
        refResult.current = ((...args) => {
          for (const handler of given) {
            handler(...args);
          }
        }) as H;
        break;
    }

    return () => {
      refResult.current = undefined;
    };
  }, [handlers]);

  return refResult as Readonly<typeof refResult>;
};
