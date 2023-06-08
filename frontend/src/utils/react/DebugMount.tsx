import { FC, useEffect, useState } from "react";

interface Props {
  name: string;
}

let id = 0;

export const DebugMount: FC<Props> = ({ name }) => {
  const [iid] = useState(() => ++id);
  useEffect(() => {
    console.log(">> Mount  ", [name, iid]);
    return () => console.log(">> Unmount", [name, iid]);
  }, [iid, name]);
  return null;
};
