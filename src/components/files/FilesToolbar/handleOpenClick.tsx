import { ReactNode } from "react";
import { openFile } from "backend";
import { detectDriverFormat } from "drivers";
import { addLevelsetFileFx } from "models/levelsets";
import { showToastErrorWrap } from "models/ui/toasts";
import { msgBox } from "ui/feedback";

const openFiles = async (files: readonly File[]) => {
  const detected = await Promise.allSettled(
    files.map(
      async (file) =>
        [
          file,
          detectDriverFormat(await file.arrayBuffer(), file.name),
        ] as const,
    ),
  );
  const errors: ReactNode[] = [];
  for (const [i, item] of detected.entries()) {
    if (item.status === "fulfilled") {
      const [file, d] = item.value;
      if (d) {
        const [driverName, driverFormat] = d;
        addLevelsetFileFx({
          file,
          driverName,
          driverFormat,
          name: file.name,
        });
      } else {
        errors.push(<>"{file.name}": Unsupported file format.</>);
      }
    } else {
      errors.push(
        <>
          "{files[i].name}": Couldn't read file:{" "}
          {item.reason instanceof Error
            ? item.reason.message
            : "unknown reason"}
          .
        </>,
      );
      showToastErrorWrap("Cannot read file", item.reason);
    }
  }
  if (errors.length) {
    // TODO: typography component to add intro text with apply uiColor
    msgBox(
      <ul>
        {errors.map((err, i) => (
          <li key={i}>{err}</li>
        ))}
      </ul>,
    );
  }
};

export const handleOpenClick = () =>
  openFile({
    multiple: true,
    done: openFiles,
  });
