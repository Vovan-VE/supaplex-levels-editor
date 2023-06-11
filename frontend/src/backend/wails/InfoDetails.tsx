import { FC } from "react";

export const InfoDetails: FC = () => (
  <>
    <h3>Desktop SpLE</h3>
    <p>
      Desktop version of <strong>SpLE</strong> built using{" "}
      <a
        href="https://github.com/wailsapp/wails"
        target="_blank"
        rel="noopener noreferrer"
      >
        Wails
      </a>
      . It uses the same source code as web app{" "}
      <a href="https://sple.me">sple.me</a> to render frontend, but with some
      different backend bindings to work with its host binary in desktop
      environment.
    </p>
    <p>
      <strong>Desktop SpLE</strong> compared to{" "}
      <a href="https://sple.me">sple.me</a> <strong>DOES</strong> work with
      regular files on your device, like other whatever desktop editors do.
    </p>
  </>
);
