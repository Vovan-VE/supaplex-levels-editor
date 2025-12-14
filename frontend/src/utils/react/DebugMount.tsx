import { FC, useEffect, useId } from "react";

interface Props {
  name: string;
}

export const DebugMount: FC<Props> = ({ name }) => {
  const iid = useId();
  useEffect(() => {
    console.log(">> Mount  ", [name, iid]);
    return () => console.log(">> Unmount", [name, iid]);
  }, [iid, name]);
  return null;
};
