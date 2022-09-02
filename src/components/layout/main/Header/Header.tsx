import { FC } from "react";
import cn from "classnames";
import { detectDriver } from "drivers";
import { addLevelsetFile } from "models/levelsets";
import { Button, Toolbar } from "ui/button";
import { svgs } from "ui/icon";
import { ContainerProps } from "ui/types";
import { EditorTabs } from "./EditorTabs";
import cl from "./Header.module.scss";

interface Props extends ContainerProps {}

export const Header: FC<Props> = ({ className, ...rest }) => (
  <header {...rest} className={cn(cl.root, className)}>
    <Toolbar className={cl.toolbar}>
      <Button icon={<svgs.FileBlank />} title="Create new levelset..." />
      <Button
        icon={<svgs.DirOpen />}
        onClick={handleOpenClick}
        title="Open files..."
      />
    </Toolbar>
    <EditorTabs className={cl.tabs} />
  </header>
);

function handleOpenClick() {
  const d = window.document;
  const input = d.createElement("input");
  input.setAttribute("type", "file");
  input.setAttribute("multiple", "multiple");
  input.style.visibility = "hidden";
  input.style.position = "absolute";
  d.body.appendChild(input);
  input.addEventListener("change", handler);
  input.click();

  function handler() {
    const files = input.files;
    input.removeEventListener("change", handler);
    d.body.removeChild(input);

    if (files) {
      (async () => {
        for (const item of await Promise.allSettled(
          Array.from(files).map(
            async (file) =>
              [file, detectDriver(await file.arrayBuffer())] as const,
          ),
        )) {
          if (item.status === "fulfilled") {
            const [file, driverName] = item.value;
            if (driverName) {
              addLevelsetFile({
                file,
                driverName,
                name: file.name,
              });
            } else {
              console.warn("Cannot detect file format", file);
            }
          } else {
            console.error("Cannot read file", item.reason);
          }
        }
      })();
    }
  }
}
