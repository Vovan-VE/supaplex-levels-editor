import { FC } from "react";
import {
  APP_TITLE,
  TEST_LEVEL_TITLE,
  TEST_LEVEL_URL,
  VERSION_URL,
} from "configs";

export const InfoDetails: FC = () => (
  <>
    <h3>
      <strong>sple.me</strong> Important notes
    </h3>
    <p>
      <strong>sple.me</strong> is completely frontend (client side) application
      (web page). It works only with pseudo-files in browser memory.
      <br />
      See also <strong>Desktop SpLE</strong> at{" "}
      <a href={VERSION_URL} target="_blank" rel="noopener noreferrer">
        GutHub repo
      </a>
      .
    </p>
    <ul>
      <li>
        After you opened existing file, it becomes in-memory copy of the
        original file. Technically you are uploading your local file to a web
        page.
      </li>
      <li>
        In-memory files you opened or created from scratch are{" "}
        <strong>NOT</strong> related to regular files out of browser.
      </li>
      <li>
        To get your modified file back as regular file technically you need to
        download file from web page (with appropriate UI button in{" "}
        <strong>sple.me</strong>).
      </li>
    </ul>
    <p>Also:</p>
    <ul>
      <li>
        <p>
          <strong>sple.me</strong> application uses <code>indexedDB</code> and{" "}
          <code>localStorage</code> for better user experience. These things are
          similar to well known <em>Cookies</em> in terms of privacy.
        </p>
        <p>
          <strong>sple.me</strong> will try to remember your modified in-memory
          files and some preferences in browser storage for better user
          experience.
        </p>
      </li>
      <li>
        <p>
          There are no intention to send any kind of your data to somewhere
          without your confirmation.
        </p>
        <p>
          <strong>sple.me</strong> when completely loaded is operating locally
          in your browser. Neither external storages, nor cross-device sync are
          implied, nor planned.
        </p>
        <p>
          <strong>sple.me</strong> uses{" "}
          <a href={TEST_LEVEL_URL} target="_blank" rel="noopener noreferrer">
            {TEST_LEVEL_TITLE} test page
          </a>{" "}
          to test your level when you request that.
        </p>
      </li>
      <li>
        <p>
          <strong>DON'T</strong> rely much on browser storage to remember your
          modified in-memory files forever. <strong>DO SAVE BACKUPS</strong>.
          Browser can clean its storage.
        </p>
        <p>
          Also, <strong>sple.me</strong> storage in browser can be accidentally
          reset in case of some errors in <strong>{APP_TITLE}</strong> itself.
          Because, you know: <em>Every program has at least one bug</em>.
        </p>
      </li>
    </ul>
  </>
);
