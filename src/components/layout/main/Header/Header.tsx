import { FC } from "react";
import cn from "classnames";
import { useStore } from "effector-react";
import { detectDriver } from "drivers";
import {
  $currentLevelsetFile,
  addLevelsetFileFx,
  downloadCurrentFile,
  removeCurrentLevelsetFile,
} from "models/levelsets";
import { Button, Toolbar } from "ui/button";
import { svgs } from "ui/icon";
import { ColorType, ContainerProps } from "ui/types";
import { EditorTabs } from "./EditorTabs";
import cl from "./Header.module.scss";

interface Props extends ContainerProps {}

export const Header: FC<Props> = ({ className, ...rest }) => {
  const currentFile = useStore($currentLevelsetFile);

  return (
    <header {...rest} className={cn(cl.root, className)}>
      <Toolbar className={cl.start}>
        <Button icon={<svgs.FileBlank />} title="Create new levelset..." />
        <Button
          icon={<svgs.DirOpen />}
          onClick={handleOpenClick}
          title="Open files..."
        />
      </Toolbar>

      <EditorTabs className={cl.tabs} />

      <Toolbar className={cl.end}>
        <Button
          uiColor={ColorType.SUCCESS}
          icon={<svgs.Download />}
          disabled={!currentFile}
          title={
            currentFile
              ? `Download file "${currentFile.name}" from memory`
              : undefined
          }
          onClick={downloadCurrentFile}
        />
        <Button
          uiColor={ColorType.DANGER}
          icon={<svgs.Trash />}
          disabled={!currentFile}
          title={
            currentFile
              ? `Remove levelset "${currentFile.name}" from memory`
              : undefined
          }
          // TODO: confirm
          onClick={removeCurrentLevelsetFile}
        />
      </Toolbar>
    </header>
  );
};

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
              addLevelsetFileFx({
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
