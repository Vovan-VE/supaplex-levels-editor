import { FC, PropsWithChildren, ReactHTML } from "react";

interface Props extends PropsWithChildren<{}> {
  different: boolean;
  side: 0 | 1;
}

export const DiffValue: FC<Props> = ({ different, side, children }) => {
  const Element: keyof ReactHTML = different ? (side ? "ins" : "del") : "span";
  return <Element>{children}</Element>;
};
