import { FC, useMemo } from "react";
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
import { ask } from "ui/feedback";
import { svgs } from "ui/icon";
import { ColorType, ContainerProps } from "ui/types";
import { EditorTabs } from "./EditorTabs";
import cl from "./Header.module.scss";

interface Props extends ContainerProps {}

export const Header: FC<Props> = ({ className, ...rest }) => {
  const currentFile = useStore($currentLevelsetFile);

  const filename = currentFile?.name;
  const handleRemoveClick = useMemo(
    () =>
      filename
        ? async () => {
            if (
              await ask(
                <>
                  Are you sure to remove file "<b>{filename}</b>" from memory?
                  <br />
                  You will loss all changes in the file. Consider download it
                  first to backup.
                  <br />
                  <b>This action would not be undone.</b>
                </>,
                {
                  buttons: {
                    okText: <>Forgot "{filename}"</>,
                    ok: {
                      uiColor: ColorType.DANGER,
                      autoFocus: false,
                    },
                    cancel: {
                      autoFocus: true,
                    },
                  },
                },
              )
            ) {
              removeCurrentLevelsetFile();
            }
          }
        : undefined,
    [filename],
  );

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
            filename ? `Download file "${filename}" from memory` : undefined
          }
          onClick={downloadCurrentFile}
        />
        <Button
          icon={<svgs.Rename />}
          disabled={!currentFile}
          title="Rename file"
        />
        <Button
          uiColor={ColorType.DANGER}
          icon={<svgs.Trash />}
          disabled={!currentFile}
          title={
            filename ? `Remove levelset "${filename}" from memory` : undefined
          }
          onClick={handleRemoveClick}
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
