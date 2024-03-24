import { FC, ReactElement, Suspense, useEffect, useRef, useState } from "react";
import * as RoMap from "@cubux/readonly-map";
import { setContainer, unsetContainer } from "./container";

export const PromptContainer: FC = () => {
  const refId = useRef(0);
  const [instances, setInstances] = useState<ReadonlyMap<number, ReactElement>>(
    new Map(),
  );

  useEffect(() => {
    setContainer({
      add() {
        const id = ++refId.current;
        return {
          index: id,
          render: (node) => setInstances((map) => RoMap.set(map, id, node)),
          delete: () => setInstances((map) => RoMap.remove(map, id)),
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
