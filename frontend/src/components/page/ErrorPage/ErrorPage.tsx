import { FC, useCallback } from "react";
import { BUGS_URL } from "configs";

// REFACT: move to backend

const handleClearLocalStorage = () => {
  if (
    window.confirm(
      "Confirm to clear localStorage?\n" +
        "You can loss some less significant data like settings.\n" +
        "Page will be reloaded then.",
    )
  ) {
    window.localStorage.clear();
    window.location.reload();
  }
};

const handleClearIndexedDB = () => {
  if (
    window.confirm(
      "Confirm to clear indexedDB?\n" +
        "You will loss all in-memory files.\n" +
        "Page will be reloaded then.",
    )
  ) {
    window.indexedDB
      .databases()
      .then((dbs) =>
        Promise.allSettled(
          dbs.map((db) => {
            if (db.name) {
              const r = window.indexedDB.deleteDatabase(db.name);
              return new Promise((resolve, reject) => {
                r.onerror = reject;
                r.onsuccess = resolve;
              });
            }
            return undefined;
          }),
        ),
      )
      .then(() => window.location.reload());
  }
};

interface Props {
  error?: unknown;
}

export const ErrorPage: FC<Props> = ({ error }) => {
  const handleRefresh = useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <main>
      <h1>Error</h1>
      <p>Sorry, an error occurred. Try to the following options in order:</p>
      <ol>
        <li>
          Just <button onClick={handleRefresh}>Reload page</button>.
        </li>
        <li>
          Reload page without cache (
          <kbd>
            <kbd>Ctrl</kbd>+<kbd>F5</kbd>
          </kbd>{" "}
          on desktop).
        </li>
        <li>
          Check internet connection and proxy settings. I know it's pretty
          stupid case in general, but I personally can fail so.
        </li>
        <li>
          Check whether this site works for you right now in different browser
          and/or device. This can be different depending on kind and source of
          error.
        </li>
        <li>
          DATA LOSS: Try to clear{" "}
          <button onClick={handleClearLocalStorage}>
            <code>localStorage</code>
          </button>
          . You can loss some less significant data like settings.
        </li>
        <li>
          <b>DATA LOSS</b>: Try to clear{" "}
          <button onClick={handleClearIndexedDB}>
            <code>indexedDB</code>
          </button>
          . You will loss all in-memory files.
        </li>
        <li>
          Check <a href={BUGS_URL}>issues</a> and try to find already existing
          issue. Otherwise fill free to report a new issue there.
        </li>
      </ol>

      {error instanceof Error && <pre>{error.message}</pre>}
    </main>
  );
};
