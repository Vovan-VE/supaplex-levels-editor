import { FC, PropsWithChildren, ReactElement } from "react";

export const constElement = (el: ReactElement): ReactElement => {
  const C = () => el;
  return <C />;
};

export const constComponent = (C: FC<PropsWithChildren<{}>>) => <C />;
