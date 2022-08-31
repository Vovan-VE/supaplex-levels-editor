import { FC, PropsWithChildren } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import cl from "./MainLayout.module.scss";

interface Props {}

export const MainLayout: FC<PropsWithChildren<Props>> = ({ children }) => {
  return (
    <div className={cl.root}>
      <Header className={cl.header} />
      <main className={cl.main}>{children}</main>
      <Footer className={cl.footer} />
    </div>
  );
};
