import { FC, ReactNode } from "react";
import { Spinner } from "ui/feedback";
import cl from "./Loading.module.scss";

interface Props {
  message?: ReactNode;
}

export const Loading: FC<Props> = ({ message }) => {
  return (
    <div className={cl.root}>
      <Spinner inline /> {message ?? "Loading..."}
    </div>
  );
};
