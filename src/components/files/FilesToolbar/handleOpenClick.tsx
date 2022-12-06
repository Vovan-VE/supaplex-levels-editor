import { ReactNode } from "react";
import { detectDriverFormat } from "drivers";
import { addLevelsetFileFx } from "models/levelsets";
import { msgBox } from "ui/feedback";

export const handleOpenClick = () => {
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
        const detected = await Promise.allSettled(
          Array.from(files).map(
            async (file) =>
              [file, detectDriverFormat(await file.arrayBuffer())] as const,
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
            console.error("Cannot read file", item.reason);
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
      })();
    }
  }
};
