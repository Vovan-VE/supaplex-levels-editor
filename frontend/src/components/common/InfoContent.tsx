import { FC } from "react";
import { APP_TITLE, APP_VERSION } from "configs";
import { msgBox } from "ui/feedback";
import cl from "./InfoContent.module.scss";

export const showInfoDialog = () =>
  msgBox(<InfoContent />, {
    size: "full",
    closeSetAutoFocus: true,
    button: {
      text: "Close",
      autoFocus: false,
    },
  });

const InfoContent: FC = () => (
  <div className={cl.root}>
    <img
      src="/favicon.svg"
      alt={APP_TITLE}
      width={96}
      height={96}
      className={cl.logo}
    />
    <h1>
      {APP_TITLE} <span>v{APP_VERSION}</span>
    </h1>
    <p>
      <strong>{APP_TITLE}</strong> is <strong>Supaplex Levels Editor</strong> in
      browser. Inspired by{" "}
      <a href="components/common/InfoContent">Supaplex.Online</a> and its
      community.
    </p>

    <h2>How it works</h2>
    <p>
      First you either open existing file from your device, or create new one
      from scratch. After that the file is stored in browser memory. You can
      open or create several file at the same time.
    </p>
    <p>Files in browser memory:</p>
    <ul>
      <li>
        are <strong>not</strong> related and are <strong>not</strong> linked to
        source file you loaded into browser, because browsers work so;
      </li>
      <li>
        will <strong>not</strong> be sent to anywhere since everything is
        operating locally right in your browser;
      </li>
      <li>
        <strong>could</strong> be remembered in browser when you close, suspense
        or leave this web page (this should work fine in most of modern browsers
        unless private mode).
      </li>
    </ul>
    <p>So:</p>
    <ul>
      <li>
        To save edited file from browser memory back to device you should
        "download" file from browser with appropriate button on the page.
      </li>
      <li>
        You can drop unneeded files from memory with appropriate button on the
        page.
      </li>
      <li>
        <strong>DO NOT</strong> rely to the fact, that files are remembering in
        browser's memory. <strong>DO</strong> save <strong>BACKUPS</strong>.
        Browser can clean storage.
      </li>
      <li>
        This page uses <code>indexedDB</code> and <code>localStorage</code>{" "}
        (which both are similar to Cookies in terms of privacy) for better user
        experience.
      </li>
    </ul>
  </div>
);
