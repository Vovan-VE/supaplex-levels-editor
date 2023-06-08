import { FC, ReactElement, Suspense, useEffect, useRef, useState } from "react";
import * as RoMap from "@cubux/readonly-map";

export type DialogContainerNode = {
  readonly index: number;
  render(node: ReactElement): void;
  delete(): void;
};

interface IContainer {
  add(): DialogContainerNode;
}

let container: IContainer | null = null;

export const getPromptContainer = () => {
  if (!container) {
    throw new Error(`PromptContainer does not exist`);
  }
  return container;
};

export const PromptContainer: FC = () => {
  const refId = useRef(0);
  const [instances, setInstances] = useState<ReadonlyMap<number, ReactElement>>(
    new Map(),
  );

  useEffect(() => {
    if (container) {
      throw new Error(`PromptContainer already exist`);
    }

    const me = (container = {
      add() {
        const id = ++refId.current;

        return {
          index: id,
          render: (node) => setInstances((map) => RoMap.set(map, id, node)),
          delete: () => setInstances((map) => RoMap.remove(map, id)),
        };
      },
    });

    return () => {
      if (container === me) {
        container = null;
      }
    };
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
