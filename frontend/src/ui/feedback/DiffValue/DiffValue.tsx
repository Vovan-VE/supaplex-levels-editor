import { FC, JSX, PropsWithChildren } from "react";

interface Props extends PropsWithChildren<object> {
  different: boolean;
  side: 0 | 1;
}

export const DiffValue: FC<Props> = ({ different, side, children }) => {
  const Element: keyof JSX.IntrinsicElements = different
    ? side
      ? "ins"
      : "del"
    : "span";
  return <Element>{children}</Element>;
};
