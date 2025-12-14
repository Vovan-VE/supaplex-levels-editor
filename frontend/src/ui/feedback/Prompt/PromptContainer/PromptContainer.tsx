import {
  FC,
  ReactElement,
  Suspense,
  useEffect,
  useReducer,
  useRef,
} from "react";
import * as RoMap from "@cubux/readonly-map";
import { setContainer, unsetContainer } from "./container";

type _Instances = ReadonlyMap<number, ReactElement>;
interface SetInstance {
  id: number;
  node?: ReactElement;
}

export const PromptContainer: FC = () => {
  const refId = useRef(0);
  const [instances, dispatchInstance] = useReducer(
    (map: _Instances, { id, node }: SetInstance) =>
      node ? RoMap.set(map, id, node) : RoMap.remove(map, id),
    new Map(),
  );

  useEffect(() => {
    setContainer({
      add() {
        const id = ++refId.current;
        return {
          index: id,
          render: (node) => dispatchInstance({ id, node }),
          delete: () => dispatchInstance({ id }),
        };
      },
    });
    return unsetContainer;
  }, []);

  return (
    <>
      {[...instances].map(([id, node]) => (
        // Some children may use `React.lazy()`.
        // Without this Suspense components outside this, but
        // inside closest Suspense will blink to "loading" too.
        <Suspense key={id}>{node}</Suspense>
      ))}
    </>
  );
};
